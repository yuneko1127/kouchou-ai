import os

import openai
from dotenv import load_dotenv

# FIXME: Issue #58
from langchain.embeddings import OpenAIEmbeddings
from openai import AzureOpenAI

# from langchain_openai import AzureOpenAIEmbeddings


DOTENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../.env"))
load_dotenv(DOTENV_PATH)


def request_to_openai(
    messages: list[dict],
    model: str = "gpt-4",
    is_json: bool = False,
) -> dict:
    openai.api_type = "openai"
    response_format = {"type": "json_object"} if is_json else None
    response = openai.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,
        n=1,
        seed=0,
        response_format=response_format,
        timeout=30,
    )
    return response.choices[0].message.content


def request_to_azure_chatcompletion(
    messages: list[dict],
    is_json: bool = False,
) -> dict:
    azure_endpoint = os.getenv("AZURE_CHATCOMPLETION_ENDPOINT")
    deployment = os.getenv("AZURE_CHATCOMPLETION_DEPLOYMENT_NAME")
    api_key = os.getenv("AZURE_CHATCOMPLETION_API_KEY")
    api_version = os.getenv("AZURE_CHATCOMPLETION_VERSION")
    assert azure_endpoint and deployment and api_key and api_version

    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=azure_endpoint,
        api_key=api_key,
    )

    if is_json:
        response_format = {"type": "json_object"}
    else:
        response_format = None

    response = client.chat.completions.create(
        model=deployment,
        messages=messages,
        temperature=0,
        n=1,
        seed=0,
        response_format=response_format,
        timeout=30,
    )

    return response.choices[0].message.content


def request_to_chat_openai(
    messages: list[dict],
    model: str = "gpt-4o",
    is_json: bool = False,
) -> dict:
    use_azure = os.getenv("USE_AZURE", "false").lower()
    if use_azure == "true":
        return request_to_azure_chatcompletion(messages, is_json)
    else:
        return request_to_openai(messages, model, is_json)


EMBDDING_MODELS = [
    "text-embedding-3-large",
    "text-embedding-3-small",
]


def _validate_model(model):
    if model not in EMBDDING_MODELS:
        raise RuntimeError(f"Invalid embedding model: {model}, available models: {EMBDDING_MODELS}")


def request_to_embed(args, model):
    use_azure = os.getenv("USE_AZURE", "false").lower()
    if use_azure == "true":
        return request_to_azure_embed(args, model)

    else:
        _validate_model(model)
        embeds = OpenAIEmbeddings(model=model).embed_documents(args)
    return embeds


def request_to_azure_embed(args, model):
    azure_endpoint = os.getenv("AZURE_EMBEDDING_ENDPOINT")
    api_key = os.getenv("AZURE_EMBEDDING_API_KEY")
    api_version = os.getenv("AZURE_EMBEDDING_VERSION")
    deployment = os.getenv("AZURE_EMBEDDING_DEPLOYMENT_NAME")
    assert azure_endpoint and deployment and api_key and api_version

    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=azure_endpoint,
        api_key=api_key,
    )

    response = client.embeddings.create(input=args, model=deployment)
    return [item.embedding for item in response.data]


def _test():
    # messages = [
    #     {"role": "system", "content": "英訳せよ"},
    #     {"role": "user", "content": "これはテストです"},
    # ]
    # response = request_to_chat_openai(messages=messages, model="gpt-4o", is_json=False)
    # print(response)
    # print(request_to_embed("Hello", "text-embedding-3-large"))
    print(request_to_azure_embed("Hello", "text-embedding-3-large"))


if __name__ == "__main__":
    _test()
