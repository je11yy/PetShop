from database import Database
import json
import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone

class AuthService:
    def __init__(self, config_path: str, db: Database):
        with open(config_path, "r") as config_file:
            self.config = json.load(config_file)['jwt']
        self.db = db
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def __verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def __hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)
    
    def __create_jwt(self, user_id: int, user_email: str) -> str:
        expiration = datetime.now(timezone.utc) + timedelta(days=self.config["jwt_expiration_days"])
        token_data = {"user_email": user_email, "user_id": user_id, "exp": expiration}
        return jwt.encode(token_data, self.config["jwt_secret_key"], algorithm=self.config["jwt_algorithm"])
    
    def __decode_token(self, token: str) -> dict:
        payload = jwt.decode(token, self.config["jwt_secret_key"], algorithms=[self.config["jwt_algorithm"]])
        return payload
