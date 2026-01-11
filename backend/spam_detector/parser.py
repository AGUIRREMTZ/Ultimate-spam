"""
Email Parser for Spam Detection
Based on the original Python ML implementation
"""

from html.parser import HTMLParser
import email
import string
import nltk
from nltk.corpus import stopwords

# MLStripper class to remove HTML tags
class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.fed = []

    def handle_data(self, d):
        self.fed.append(d)

    def get_data(self):
        return ''.join(self.fed)


def strip_tags(html):
    """Remove HTML tags from text"""
    s = MLStripper()
    s.feed(html)
    return s.get_data()


class Parser:
    """
    Email parser that implements the same preprocessing logic
    as the original ML training code
    """
    def __init__(self):
        self.stemmer = nltk.PorterStemmer()
        try:
            self.stopwords = set(stopwords.words('english'))
        except LookupError:
            # Download stopwords if not available
            nltk.download('stopwords')
            self.stopwords = set(stopwords.words('english'))
        self.punctuation = list(string.punctuation)

    def parse_from_string(self, email_content):
        """Parse an email from string content"""
        try:
            msg = email.message_from_string(email_content)
            return self.get_email_content(msg) if msg else None
        except Exception as e:
            print(f"Error parsing email: {e}")
            return None

    def get_email_content(self, msg):
        """Extract the email content"""
        subject = self.tokenize(msg['Subject']) if msg['Subject'] else []
        body = self.get_email_body(msg.get_payload(), msg.get_content_type())
        content_type = msg.get_content_type()
        
        return {
            "subject": subject,
            "body": body,
            "content_type": content_type,
            "all_tokens": subject + body
        }

    def get_email_body(self, payload, content_type):
        """Extract the body of the email"""
        body = []
        if isinstance(payload, str) and content_type == 'text/plain':
            return self.tokenize(payload)
        elif isinstance(payload, str) and content_type == 'text/html':
            return self.tokenize(strip_tags(payload))
        elif isinstance(payload, list):
            for p in payload:
                body += self.get_email_body(p.get_payload(), p.get_content_type())
        return body

    def tokenize(self, text):
        """
        Transform a text string into tokens.
        Clean punctuation symbols and do stemming of the text.
        """
        if not text:
            return []
        
        # Remove punctuation
        for c in self.punctuation:
            text = text.replace(c, "")
        text = text.replace("\t", " ")
        text = text.replace("\n", " ")

        # Split into tokens
        tokens = list(filter(None, text.split(" ")))
        
        # Apply stemming and remove stopwords
        return [self.stemmer.stem(w.lower()) for w in tokens if w.lower() not in self.stopwords]
