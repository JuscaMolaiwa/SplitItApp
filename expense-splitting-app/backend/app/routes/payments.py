from flask import Blueprint, request, jsonify
from ..models import Payment, Balance, db
from ..utils.auth_utils import login_required
import stripe
import paypalrestsdk

bp = Blueprint('payments', __name__)

@bp.route('/api/payments/stripe', methods=['POST'])
@login_required
def create_stripe_payment(user_id):
  data = request.get_json()
  amount = data.get('amount')
  currency = data.get('currency', 'usd')

  try:
    # create a Stripe PaymentIntent
    intent = stripe.PaymentIntent.create(
      amount=int(amount * 100), # Stripe expects amounts in cents
      currency=currency,
      metadata={'user_id': user_id}
    )

    #save payment record
    payment = Payment(
      user_id=user_id,
      amount=amount,
      currency=currency,
      payment_method='stripe',
      payment_status='pending'
    )
    db.session.add(payment)
    db.session.commit()

    return jsonify({'client_secret': intent.client_secret}), 200
  except Exception as e:
    return jsonify({'error': str(e)}), 400
  
@bp.route('/api/payments/paypal', methods=['POST'])
@login_required
def create_paypal_payment(user_id):
  data = request.get_json()
  amount = data.get('amount')
  currency = data.get('currency', 'USD')

  payment = paypalrestsdk.Payment({
    'intent': 'sale',
    'payer': {
        'payment_method': 'paypal'
    },
    'transactions': [{
        'amount': {
            'total': str(amount),
            'currency': currency
        },
        'description': 'Payment for Expense Splitting App'
    }],
    'redirect_urls': {
        'return_url': 'http://localhost:3000/payment/success',
        'cancel_url': 'http://localhost:3000/payment/cancel'
    }
})

  if payment.create():
    #save payment record
    payment_record = Payment(
      user_id=user_id,
      amount=amount,
      currency=currency,
      payment_method='paypal',
      payment_status='pending'
    )
    db.session.add(payment_record)
    db.session.commit()

    for link in payment.links:
      if link.rel == 'approval_url':
        approval_url = link.href
        return jsonify({'approval_url': approval_url}), 200
  else:
    return jsonify({'error': payment.error}), 400
  
@bp.route('/api/payments/stripe/webhook', methods=['POST'])
def stripe_webhook():
  payload = request.get_data(as_text=True)
  sig_header = request.headers.get('Stripe-Signature')
  endpoint_secret = 'your_stripe_webhook_secret'

  try:
    event = stripe.Webhook.construct_event(
      payload, sig_header, endpoint_secret
    )
  except ValueError as e:
    return jsonify({'error': 'Invalid payload'}), 400
  except stripe.error.SignatureVerificationError as e:
    return jsonify({'error': 'Invalid signature'}), 400
  
  if event['type'] == 'payment_intent.succeeded':
    intent = event['data']['object']
    user_id = intent['metadata']['user_id']
    amount = intent['amount'] / 100 # convert back to dollars

    #update payment record
    payment = Payment.query.filter_by(user_id=user_id, amount=amount, payment_method='stripe').first()
    if payment:
      payment.payment_status = 'success'
      db.session.commit()

    #update user balance
    balance = Balance.query.filter_by(user_id=user_id).first()
    if balance:
      balance.balance -= amount
    else:
      balance = Balance(user_id=user_id, balance=-amount)
      db.session.add(balance)
    db.session.commit()

  return jsonify({'status': 'success'}), 200

@bp.route("/api/payments/paypal/success", methods=['GET'])
def paypal_success():
  payment_id = request.args.get('paymentId')
  payer_id = request.args.get('PayerID')

  payment = paypalrestsdk.Payment.find(payment_id)

  if payment.execute({'payer_id': payer_id}):
    user_id = payment.transactions[0].item_list.items[0].sku
    amount = float(payment.transaction[0].amount.total)

    #update payment record
    payment_record = Payment.query.filter_by(user_id=user_id, amount=amount, payment_method='paypal').first()
    if payment_record:
      payment_record.payment_status = 'completed'
      db.session.commit()
    
    #update user balance
    balance = Balance.query.filter_by(user_id=user_id).first()
    if balance:
      balance.balance -= amount
    else:
      balance = Balance(user_id=user_id, balance=-amount)
    db.session.commit()

    return jsonify({'status':'success'}), 200
  else:
    return jsonify({'error': payment.error}),400

@bp.route('/api/payment/history', methods=['GET'])
@login_required
def get_payment_history(user_id):
  """Retrieve payment history for the logged-in user"""
  try:
    payments = Payment.query.filter_by(user_id=user_id).all()
    payment_history = [
      {
        'id': payment.id,
        'amount': payment.amount,
        'currency': payment.currency,
        'payment_method': payment.payment_method,
        'payment_status': payment.payment_status,
        'created_at': payment.created_at
      }
      for payment in payments
    ]
    return jsonify({'payment_history': payment_history}), 200
  except Exception as e:
    return jsonify({'error': 'Failed to retrive payment history', 'details': str(e)}), 500