"""
Django API Views for Spam Detection
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import joblib
import os
from .parser import Parser

# Load models
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'static', 'modelo_spam.joblib')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'static', 'vectorizador.joblib')

# Initialize parser
parser = Parser()

# Load models (will be loaded once when server starts)
model = None
vectorizer = None

def load_models():
    """Load ML models from disk"""
    global model, vectorizer
    try:
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        print("Models loaded successfully!")
    except Exception as e:
        print(f"Error loading models: {e}")


@csrf_exempt
@require_http_methods(["POST"])
def predict(request):
    """
    Endpoint to predict if an email is spam or ham
    
    Expected POST body:
    {
        "email_content": "Full email content as string"
    }
    
    Returns:
    {
        "prediction": "Spam" or "Ham",
        "probability": {
            "spam": 0.XX,
            "ham": 0.XX
        },
        "tokens": [...],
        "feature_weights": [...top features...]
    }
    """
    # Load models if not already loaded
    if model is None or vectorizer is None:
        load_models()
    
    if model is None or vectorizer is None:
        return JsonResponse({
            'error': 'Models not loaded. Please ensure modelo_spam.joblib and vectorizador.joblib are in static/ folder'
        }, status=500)
    
    try:
        # Parse request
        data = json.loads(request.body)
        email_content = data.get('email_content', '')
        
        if not email_content:
            return JsonResponse({'error': 'email_content is required'}, status=400)
        
        # Parse email
        parsed = parser.parse_from_string(email_content)
        if not parsed:
            return JsonResponse({'error': 'Failed to parse email'}, status=400)
        
        # Get all tokens
        tokens = parsed['all_tokens']
        
        # Join tokens into a single string for vectorization
        email_text = ' '.join(tokens)
        
        # Vectorize
        X = vectorizer.transform([email_text])
        
        # Predict
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        
        # Get feature names and weights for top features
        feature_names = vectorizer.get_feature_names_out()
        feature_weights = []
        
        # Get non-zero features
        nonzero_indices = X.nonzero()[1]
        if len(nonzero_indices) > 0:
            # Get coefficients for the predicted class
            coef = model.coef_[0]
            
            # Get top 10 features by absolute weight
            feature_importance = [(feature_names[i], float(coef[i]), float(X[0, i])) 
                                   for i in nonzero_indices]
            feature_importance.sort(key=lambda x: abs(x[1] * x[2]), reverse=True)
            feature_weights = [
                {'word': word, 'weight': weight, 'count': count}
                for word, weight, count in feature_importance[:15]
            ]
        
        # Prepare response
        response = {
            'prediction': 'Spam' if prediction == 'spam' else 'Ham',
            'probability': {
                'spam': float(probabilities[1] if len(probabilities) > 1 else probabilities[0]),
                'ham': float(probabilities[0])
            },
            'tokens': tokens[:50],  # Return first 50 tokens
            'total_tokens': len(tokens),
            'feature_weights': feature_weights,
            'parsed_content': {
                'subject_tokens': parsed['subject'][:20],
                'body_tokens_preview': parsed['body'][:30],
                'content_type': parsed['content_type']
            }
        }
        
        return JsonResponse(response)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'ok',
        'models_loaded': model is not None and vectorizer is not None
    })
