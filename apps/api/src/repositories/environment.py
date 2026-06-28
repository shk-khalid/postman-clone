from sqlalchemy.orm import Session
from src.models.environment import Environment
from src.models.variable import Variable


class EnvironmentRepository:
    """
    Repository for Environment and Variable database operations.
    No business logic.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(self, name: str) -> Environment:
        env = Environment(name=name)
        self.db.add(env)
        self.db.commit()
        self.db.refresh(env)
        return env

    def get(self, env_id: int) -> Environment | None:
        return self.db.query(Environment).filter(Environment.id == env_id).first()

    def list(self) -> list[Environment]:
        return self.db.query(Environment).order_by(Environment.name).all()

    def update(self, env: Environment, name: str | None = None) -> Environment:
        if name is not None:
            env.name = name
        self.db.commit()
        self.db.refresh(env)
        return env

    def delete(self, env: Environment) -> None:
        self.db.delete(env)
        self.db.commit()

    def add_variable(self, env_id: int, key: str, value: str) -> Variable:
        var = Variable(environment_id=env_id, key=key, value=value)
        self.db.add(var)
        self.db.commit()
        self.db.refresh(var)
        return var

    def update_variable(self, var: Variable, key: str | None = None, value: str | None = None) -> Variable:
        if key is not None:
            var.key = key
        if value is not None:
            var.value = value
        self.db.commit()
        self.db.refresh(var)
        return var

    def delete_variable(self, var: Variable) -> None:
        self.db.delete(var)
        self.db.commit()

    def get_variable(self, var_id: int) -> Variable | None:
        return self.db.query(Variable).filter(Variable.id == var_id).first()

    def get_variable_by_key(self, env_id: int, key: str) -> Variable | None:
        return self.db.query(Variable).filter(
            Variable.environment_id == env_id,
            Variable.key == key
        ).first()
