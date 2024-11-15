from flask import Flask # type: ignore
from flask import Flask, jsonify # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from flask_migrate import Migrate # type: ignore
from flask_cors import CORS # type: ignore
from .config import DevelopmentConfig  # Change this to the appropriate config class
from flask_jwt_extended import JWTManager # type: ignore
from .utils import auth_utils

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)

    app.config.from_object(config_class)
    
    # Initialize JWTManager
    jwt = JWTManager(app)
    
     # Register token blocklist loader
    from .routes.logout import blacklist_loader  # Import the blacklist loader function
    jwt.token_in_blocklist_loader(blacklist_loader)

    # Enable CORS for the application
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}}, supports_credentials=True)

    # Initialize the database and migration with the app
    db.init_app(app)
    migrate.init_app(app, db)

    # Import and register blueprints or routes
    from .routes import auth, logout, groups, profile, expenses, user, admin
    app.register_blueprint(auth.bp)
    app.register_blueprint(logout.bp)
    app.register_blueprint(groups.bp)
    app.register_blueprint(profile.bp)
    app.register_blueprint(expenses.bp)
    app.register_blueprint(user.bp)
    app.register_blueprint(admin.bp)


    @app.errorhandler(Exception)
    def handle_exception(e):
        """Handle all exceptions and return a JSON response."""
        response = {
            "error": str(e),
            "message": "An unexpected error occurred."
        }
        return jsonify(response), 500
    
    return app