from langchain_core.prompts import ChatPromptTemplate

SQL_QUERY_TEMPLATE = """
Based on the table schema below, write a postgres syntax based SQL query that would answer the users question:
{schema}

Question: {question}
SQL Query
"""

NATURAL_LANGUAGE_TEMPLATE = """
Based on the table schema below, question, sql query, and response, write a natural language response:
{schema}

Question: {question}
SQL query: {query}
SQL Response: {response}
"""

class PromptTemplates:
    @staticmethod
    def get_sql_prompt() -> ChatPromptTemplate:
        return ChatPromptTemplate.from_template(SQL_QUERY_TEMPLATE)

    @staticmethod
    def get_nl_prompt() -> ChatPromptTemplate:
        return ChatPromptTemplate.from_template(NATURAL_LANGUAGE_TEMPLATE)