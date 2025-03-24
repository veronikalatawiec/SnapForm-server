# SnapForm-server

# API Endpoints

## POST /users

**Description:**  
Creates a new user and returns the authentication token.

**Parameters:**  
- **email**: User’s email as a string  
- **password**: User’s password as a string  

**Response:**
```
{
  "message": "Successfully created user",
  "token": "seyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
## POST /users/login

**Description:**  
Authenticates a user sign in and returns the JWT for other requests.

**Parameters:**  
- **email**: User’s email as a string  
- **password**: User’s password as a string  

**Response:**
```
{
  "message": "Successfully signed in",
  "token": "seyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
## GET /:user_id/forms

**Description:**  
Retrieves all forms created by the logged in user.

**Parameters:**  
- **Authentication token**: (in header)  
- **user_id**: User’s ID as an integer  

**Response:**
```
[
  {
    "form_id": 1,
    "name": "Customer Feedback",
    "status": true,
    "design_object": { "theme": "default" },
    "total_responses": 10,
    "created": "2025-01-01T12:00:00Z",
    "updated": "2025-01-02T12:00:00Z",
    "sections": [
      { "type": "text", "label": "What did you like about the product?", "options": null },
      { "type": "radio", "label": "Would you recommend this product?", "options": ["Yes", "No"] }
    ]
  },
  { ... }
]
```
## GET /:user_id/forms/:id

**Description:**  
Retrieves details of a specific form for the logged in user.

**Parameters:**  
- **Authentication token**: (in header)  
- **user_id**: User’s ID as an integer  
- **id**: Form’s ID as an integer  

**Response:**
```
{
  "form": {
    "form_id": 1,
    "name": "Customer Feedback",
    "status": true,
    "design_object": { "theme": "default" },
    "total_responses": 10,
    "created": "2025-01-01T12:00:00Z",
    "updated": "2025-01-02T12:00:00Z"
  },
  "sections": [
    { "type": "text", "label": "What did you like about the product?", "options": null },
    { "type": "radio", "label": "Would you recommend this product?", "options": ["Yes", "No"] }
  ]
}
```
## GET /forms/live/:user_id/:id

**Description:**  
Retrieves a live version of a specific form for public access by the logged in user.

**Parameters:**  
- **user_id**: User’s ID as an integer  
- **id**: Form’s ID as an integer  

**Response:**
```json
{
  "form": {
    "form_id": 1,
    "name": "Customer Feedback",
    "status": true
  },
  "sections": [
    { "type": "text", "label": "What did you like about the product?", "options": null, "id": 1 },
    { "type": "radio", "label": "Would you recommend this product?", "options": ["Yes", "No"], "id": 2 }
  ]
}
```
## POST /:user_id/forms

**Description:**  
Creates a new form associated with the user.

**Parameters:**  
- **Authentication token**: (in header)  
- **name**: Name of the form as a string  
- **status**: Form’s "active" state as a boolean  
- **sections**: Array of form section objects  
- **design_object**: Design aspects as an object  

**Response:**
```
{ "form_id": 1 }
```
## PUT /:user_id/forms/:id

**Description:**  
Updates an existing form associated with the user.

**Parameters:**  
- **Authentication token**: (in header)  
- **id**: Form’s ID as an integer  
- **name**: Name of the form as a string  
- **status**: Form’s "active" state as a boolean  
- **sections**: Array of form section objects  
- **design_object**: Updated design aspects as an object  

**Response:**
```
{
  "message": "Form successfully updated",
  "form_id": 1,
  "form": { ...updated form object... }
}
```
## DELETE /:user_id/forms/:id

**Description:**  
Deletes an existing form associated with the user.

**Parameters:**  
- **Authentication token**: (in header)  
- **id**: Form’s ID as an integer  

**Response:**
```json
{ "message": "Form deleted successfully" }
```
## GET /forms/response/:user_id/:id

**Description:**  
Retrieves the responses for a specific form for the logged in user.

**Parameters:**  
- **Authentication token**: (in header)  
- **user_id**: User’s ID as an integer  
- **id**: Form’s ID as an integer  

**Response:**
```json
{
  "totalResponses": 5,
  "responses": [
    {
      "form_id": 1,
      "form_section_id": 2,
      "content": "User response here"
    },
    { ... }
  ]
}
```
## POST /forms/response/:user_id/:id

**Description:**  
Submits responses for a public form.

**Parameters:**  
- **In the request body:**  
  - **responses**: An array of objects where each object contains:  
    - **form_section_id**: Form section ID as an integer  
    - **content**: User's response as a string  

**Response:**
```json
{
  "message": "Responses submitted successfully",
  "responses": [
    {
      "form_section_id": 1,
      "content": "Answer 1",
      "created": "2025-01-01T12:00:00Z"
    },
    { ... }
  ]
}
```
