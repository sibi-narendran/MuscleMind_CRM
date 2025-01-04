from llama_cpp import Llama
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from config.settings import OPENAI_API_KEY, LLM_MODEL, LLM_TEMPERATURE
from src.database.db_manager import DatabaseManager
from src.prompts.templates import PromptTemplates

class SQLChain:
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.llm = Llama(
            api_key=settings.LLAMA_API_KEY,
            api_base=settings.LLAMA_API_BASE_URL
        )
        self.sql_prompt = PromptTemplates.get_sql_prompt()
        self.nl_prompt = PromptTemplates.get_nl_prompt()
        
    def setup_sql_chain(self):
        return (
            RunnablePassthrough.assign(schema=self.db_manager.get_schema)
            | self.sql_prompt
            | self.llm.bind(stop="\nSQL Result:")
            | StrOutputParser()
        )

    def setup_full_chain(self):
        sql_chain = self.setup_sql_chain()
        return (
            RunnablePassthrough.assign(query=sql_chain).assign(
                schema=self.db_manager.get_schema,
                response=lambda variables: self.db_manager.run_query(variables["query"])
            )
            | self.nl_prompt
            | self.llm
        )

    def generate_response(self, prompt):
        response = self.llm.create_completion(
            prompt=prompt,
            max_tokens=500,
            temperature=0.7,
            stop=["###"]  # adjust stop tokens as needed
        )
        return response.choices[0].text.strip()