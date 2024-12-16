import logging
from typing import Dict
from flask import Blueprint, request, jsonify # type: ignore
from ..services.expense_service import ExpenseService  # Import the ExpenseService
from ..services.payment_service import PaymentService  # Import the ExpenseService
from ..utils.auth_utils import get_current_user_id, login_required
from flask_jwt_extended import jwt_required # type: ignore
from ..models import User
import stripe # type: ignore
from flask import current_app # type: ignore



bp = Blueprint('payments', __name__)


@bp.route('/api/payments/confirm', methods=['POST'])
@login_required
@jwt_required()
def confirm_payment_status():
    payment_data = request.get_json()
    payment_intent_id = payment_data.get('payment_intent_id')

    if not payment_intent_id:
        return jsonify({"error": "payment_intent_id is required"}), 400

    # Call the PaymentService to confirm the payment
    return PaymentService.confirm_payment(payment_intent_id)


@bp.route('/api/expenses/participant-payment', methods=['POST'])
@login_required
@jwt_required()
def participant_payment(user_id):
    # Get the payment details from the frontend
    payment_data = request.get_json()

    participant_id = payment_data.get('participant_id')
    amount = payment_data.get('amount')  # Amount for this participant
    currency = payment_data.get('currency')  # Amount for this participant
    payment_method = payment_data.get('payment_method')  # Payment method ID from frontend

    if not participant_id or not amount or not payment_method:
        return jsonify({'error': 'Missing participant_id, amount, or payment_method'}), 400

    try:
        # Fetch the participant from the database
        participant = ExpenseService.get_participant_by_id(participant_id)
        if not participant:
            return jsonify({'error': 'Participant not found'}), 400
        
        # Call handle_payment to process payment creation
        ExpenseService.handle_payment(user_id, amount, participant_id, currency)

        # Confirm the payment with Stripe using the stored PaymentIntent ID
        stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

        # Retrieve the PaymentIntent ID stored for the participant
        intent = stripe.PaymentIntent.confirm(
            participant['payment_intent_id'],  # Stored PaymentIntent ID for the participant
            payment_method=payment_method  # The payment method ID from the frontend
        )

        if intent.status == 'succeeded':
            # Mark the payment as successful in your database

            # Log successful payment
            logging.info(f"Payment successful for participant {participant_id}, intent ID: {intent.id}")

            ExpenseService.mark_payment_as_successful(participant_id, intent.id)

            return jsonify({'message': 'Payment successful'}), 200
        else:
            logging.warning(f"Payment failed for participant {participant_id}, intent status: {intent.status}")

            return jsonify({'error': 'Payment failed'}), 400

    except stripe.error.CardError as e:
        # Specific handling for card-related errors
        logging.error(f"CardError: {e.error.message}")
        return jsonify({'error': e.error.message}), 400
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    