import requests
import core_module.config as config

from pprint import pprint

# Define your search parameters
class SearchPapers:
    def __init__(self):
        # Initialize the Google Search parameters
        self.api_key = "AIzaSyAh8LR_ikD6ZFRuwg_MluJECSYv6ho60p4"
        self.cse_id = "35efc85a7861842a1"
        
        # Keep the config parameters for potential future use
        self.max_results = config.MAX_RESULTS

    # Perform the search with Google Custom Search API
    def getResults(self, query):
        query = "Research Papers on Topic: " + query
        print("Query in getResults: ", query)
        
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "q": query,
            "key": self.api_key,
            "cx": self.cse_id,
            "num": self.max_results
        }

        try:
            response = requests.get(url, params=params)
            results = response.json()
            
            if "items" not in results:
                print("No results found or quota exceeded.")
                return []
                
            # Process the results to match the format of the previous implementation
            processed_results = []
            for item in results["items"]:
                processed_result = {
                    'title': item.get('title', ''),
                    'href': item.get('link', ''),
                    'body': item.get('snippet', '')
                }
                processed_results.append(processed_result)
                
            return processed_results
            
        except Exception as e:
            print(f"Error performing search: {e}")
            return []

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
