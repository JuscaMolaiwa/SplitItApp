import stripe # type: ignore
from flask import current_app, jsonify, request # type: ignore
from ..models import PaymentIntent, db
from sqlalchemy.exc import SQLAlchemyError # type: ignore
import logging


class PaymentService:

    @staticmethod
    def create_payment_intent(user_id, amount, currency='ZAR'):
        try:
            # Initialize Stripe API with the secret key
            stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

            # Create a PaymentIntent with Stripe
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert amount to cents
                currency=currency,
                payment_method_types=['card'],
            )

            # Store the PaymentIntent details in the database
            payment_intent = PaymentIntent(
                payment_intent_id=intent['id'],
                user_id=user_id,
                amount=amount,
                currency=currency,
                status='pending',
                payment_method_types='card',
                payment_method_details=intent['payment_method_types'][0],
            )

            db.session.add(payment_intent)
            db.session.commit()

            return jsonify({"payment_intent_id": intent['id']}), 200

        except stripe.error.StripeError as e:
            current_app.logger.error(f"Stripe Error: {e}")
            return jsonify({"error": str(e)}), 500
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"Database Error: {e}")
            return jsonify({"error": "Database error occurred"}), 500
        except Exception as e:
            current_app.logger.error(f"General Error: {e}")
            return jsonify({"error": "An error occurred", "details": str(e)}), 500

    @staticmethod
    def confirm_payment(payment_intent_id):
        try:
            # Retrieve the PaymentIntent from Stripe
            stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            payment_intent = PaymentIntent.query.filter_by(payment_intent_id=payment_intent_id).first()
            if not payment_intent:
                return jsonify({"error": "PaymentIntent not found"}), 404

            # Check the payment status and update it in the database
            if intent['status'] == 'succeeded':
                payment_intent.status = 'succeeded'
                db.session.commit()
                return jsonify({"message": "Payment succeeded"}), 200
            else:
                return jsonify({"error": "Payment failed", "status": intent['status']}), 400

        except stripe.error.StripeError as e:
            current_app.logger.error(f"Stripe Error: {e}")
            return jsonify({"error": str(e)}), 500
        except Exception as e:
            current_app.logger.error(f"General Error: {e}")
            return jsonify({"error": "An error occurred during payment confirmation", "details": str(e)}), 500
        

    @staticmethod
    def handle_payment(user_id, total_amount, participants, currency):
        # Validate input parameters
        if not user_id or not isinstance(user_id, int):
            raise ValueError("Invalid user ID")
        if not total_amount or not isinstance(total_amount, (int, float)):
            raise ValueError("Invalid total amount")
        if not participants or not isinstance(participants, list):
            raise ValueError("Invalid participants list")
        if not currency or not isinstance(currency, str):
            raise ValueError("Invalid currency")

        try:
            # Create Payment Intent for each participant
            for participant in participants:
                participant_share = total_amount / len(participants)
                
                # Create a Stripe PaymentIntent for each participant's share
                try:
                    intent = stripe.PaymentIntent.create(
                        amount=int(participant_share * 100),  # Convert to cents
                        currency=currency,
                        payment_method_types=['card'],
                    )
                    # Store PaymentIntent ID in your database for later use
                    participant['payment_intent_id'] = intent.id
                    logging.info(f"Created PaymentIntent for participant {participant['user_id']} with ID {intent.id}")
                except stripe.error.StripeError as e:
                    logging.error(f"Failed to create PaymentIntent for participant {participant['user_id']}: {str(e)}")
                    raise ValueError(f"Failed to create PaymentIntent for participant {participant['user_id']}")

            # Commit the changes to the database after creating payment intents
            db.session.commit()

        except Exception as e:
            logging.error(f"Unexpected error during payment handling: {str(e)}")
            db.session.rollback()
            raise

    @staticmethod
    def mark_payment_as_successful(participant_id, payment_intent_id):
        """Mark the payment as successful in the database."""
        try:
            participant = PaymentService.get_participant_by_id(participant_id)
            if participant:
                # Update payment status and store payment intent ID
                participant.payment_status = 'paid'
                participant.payment_intent_id = payment_intent_id
                db.session.commit()  # Commit changes immediately
                logging.info(f"Payment status updated for participant {participant_id} with intent ID {payment_intent_id}")
            else:
                logging.warning(f"Participant {participant_id} not found for payment update")
        except SQLAlchemyError as e:
            db.session.rollback()
            logging.error(f"Database error while marking payment as successful for {participant_id}: {str(e)}")
            raise
        except Exception as e:
            logging.error(f"Failed to mark payment as successful: {str(e)}")
            db.session.rollback()
            raise

    @staticmethod
    def get_participant_by_id(participant_id):
        """Fetch the participant by ID from the database."""
        try:
            participant = PaymentService.query.get(participant_id)
            return participant
        except Exception as e:
            logging.error(f"Failed to retrieve participant with ID {participant_id}: {str(e)}")
            return None
