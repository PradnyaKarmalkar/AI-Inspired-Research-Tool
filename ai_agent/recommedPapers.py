from duckduckgo_search import DDGS
import ai_agent.config as config

from pprint import  pprint

# Define your search parameters
class SearchPapers:
    def __init__(self):
        # Initialize the DDGS object
        self.ddgs = DDGS()

        self.region = config.REGION
        self.safesearch = config.SAFESEARCH
        self.timelimit = config.TIMELIMIT
        self.backend = config.BACKEND
        self.max_results = config.MAX_RESULTS

    # Perform the search with specified parameters
    def getResults(self, query):
        query = "Research Papers on Topic: " + query
        print("Query in getResults: ", query)
        results = self.ddgs.text(
            keywords=query,
            region=self.region,
            safesearch=self.safesearch,
            timelimit=self.timelimit,
            backend=self.backend,
            max_results=self.max_results
        )

        # Process and print the results
        # for result in results:
        #     title = result.get('title')
        #     link = result.get('href')
        #     snippet = result.get('body')
        #     return f"Title: {title}\nLink: {link}\nSnippet: {snippet}\n"

        return results

# if __name__ =="__main__":
#     ws = SearchPapers()
#
#     while True:
#         user_input = input("Enter Query: ")
#         if user_input == "/quit":
#             print("Exiting...")
#             break
#
#         result = ws.getResults(query=user_input)
#         print("Result:")
#
#         pprint(result, indent=4)
