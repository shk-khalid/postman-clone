from src.repositories.environment import EnvironmentRepository
from src.schemas.environment import CreateEnvironment, UpdateEnvironment, CreateVariable, UpdateVariable
from src.models.environment import Environment
from src.models.variable import Variable


class EnvironmentServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class EnvironmentService:
    """
    Service containing business logic for Environment and Variable operations.
    """

    def __init__(self, repo: EnvironmentRepository):
        self.repo = repo

    def create_environment(self, payload: CreateEnvironment) -> Environment:
        return self.repo.create(name=payload.name)

    def get_environment(self, env_id: int) -> Environment:
        env = self.repo.get(env_id)
        if not env:
            raise EnvironmentServiceError(f"Environment with ID {env_id} not found", status_code=404)
        return env

    def list_environments(self) -> list[Environment]:
        return self.repo.list()

    def update_environment(self, env_id: int, payload: UpdateEnvironment) -> Environment:
        env = self.get_environment(env_id)
        return self.repo.update(env, name=payload.name)

    def delete_environment(self, env_id: int) -> None:
        env = self.get_environment(env_id)
        self.repo.delete(env)

    def add_variable(self, env_id: int, payload: CreateVariable) -> Variable:
        env = self.get_environment(env_id)
        
        # Validate duplicate key inside the same environment
        existing = self.repo.get_variable_by_key(env_id, payload.key)
        if existing:
            raise EnvironmentServiceError(f"Variable with key '{payload.key}' already exists in this environment")

        return self.repo.add_variable(env_id, payload.key, payload.value)

    def update_variable(self, var_id: int, payload: UpdateVariable) -> Variable:
        var = self.repo.get_variable(var_id)
        if not var:
            raise EnvironmentServiceError(f"Variable with ID {var_id} not found", status_code=404)

        if payload.key is not None and payload.key != var.key:
            # Validate duplicate name key
            existing = self.repo.get_variable_by_key(var.environment_id, payload.key)
            if existing and existing.id != var.id:
                raise EnvironmentServiceError(f"Variable with key '{payload.key}' already exists in this environment")

        return self.repo.update_variable(var, key=payload.key, value=payload.value)

    def delete_variable(self, var_id: int) -> None:
        var = self.repo.get_variable(var_id)
        if not var:
            raise EnvironmentServiceError(f"Variable with ID {var_id} not found", status_code=404)
        self.repo.delete_variable(var)

    def resolve_variables(self, text: str, variables: list[Variable]) -> str:
        """
        Helper method to resolve all template variables in a text string.
        Replaces {{key}} placeholders with variable values.
        """
        if not text:
            return text
        resolved = text
        for var in variables:
            placeholder = f"{{{{{var.key}}}}}"
            resolved = resolved.replace(placeholder, var.value)
        return resolved
