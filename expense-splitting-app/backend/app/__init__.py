from flask import Flask # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from flask_migrate import Migrate # type: ignore
from flask_cors import CORS # type: ignore
from .config import DevelopmentConfig  # Change this to the appropriate config class

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)  # Use the desired config class

    # Enable CORS for the application
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}}, supports_credentials=True)

    # Initialize the database and migration with the app
    db.init_app(app)
    migrate.init_app(app, db)

    # Import and register blueprints
    from .routes import auth, groups, profile
    app.register_blueprint(auth.bp)
    app.register_blueprint(groups.bp)
    app.register_blueprint(profile.bp)

    return app