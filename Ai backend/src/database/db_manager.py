from langchain_community.utilities import SQLDatabase
from config.settings import DB_URL

class DatabaseManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance.db = SQLDatabase.from_uri(DB_URL)
        return cls._instance

    def get_schema(self, _):
        return self.db.get_table_info()

    def run_query(self, query: str) -> str:
        return self.db.run(query)