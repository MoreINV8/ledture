## Transactions Api

### POST /api/transactions

**Request:**
- amount: required, > 0
- type: required, I or E
- transactionDate: optional, default today
- categoryId: optional, default null
- note: optional, default null

**Business Rules:**
- transactionDate cannot be more than 7 days in the past
- transaction must belong to the authenticated user
- categoryId must reference an existing category

**Success:**
201 Created

**Errors:**
400 INVALID_AMOUNT
400 INVALID_TYPE
400 TRANSACTION_TOO_OLD
401 UNAUTHORIZED
404 CATEGORY_NOT_FOUND

### PUT /api/transactions/{id} 

**Request:**
- amount: required, > 0
- type: required, I or E
- transactionDate: optional, default existing value
- categoryId: optional
- note: optional

**Business Rules:**
- transactionDate cannot be more than 7 days in the past
- transaction must belong to the authenticated user
- categoryId must reference an existing category

**Success:**
200 OK

**Errors:**
404 TRANSACTION_NOT_FOUND
400 INVALID_AMOUNT
400 INVALID_TYPE
400 TRANSACTION_TOO_OLD
404 CATEGORY_NOT_FOUND
401 UNAUTHORIZED

### DELETE /api/transactions/{id}

**Business Rules:**
- transaction must belong to the authenticated user

**Success:**
204 NO_CONTENT

**Errors:**
401 UNAUTHORIZED
404 TRANSACTION_NOT_FOUND

### GET /api/transactions?year=yyyy&month=mm&date=dd

**Business Rules:**
- transaction must belong to the authenticated user

**Success:**
200 OK

**Errors:**
400 BAD_REQUEST
401 UNAUTHORIZED

### GET /api/transactions/{id}

**Business Rules:**
- transaction must belong to the authenticated user

**Success:**
200 OK

**Errors:**
400 BAD_REQUEST
401 UNAUTHORIZED

## Users API

### POST /api/auth/register

**Request**
- email: required
- password: required

**Business Rules:**
- email must not duplicate
- password must stored as hashed

**Success:**
201 CREATED

**Errors:**
409 DUPLICATE_EMAIL

### POST /api/auth/login 

**Request**
- email: required
- password: required

**Success:**
200 OK

**Errors:**
401 UNAUTHORIZED

### POST /api/auth/logout

**Business Rules:**
- clear login session

## Categories API

### GET /api/categories

**Success:**
200 OK

**Errors**
401 UNAUTHORIZED
