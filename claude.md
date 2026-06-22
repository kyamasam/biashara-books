# Project Description
Proposed Solution: Biashara Books
A simple POS and transaction-tagging system inside the M-PESA Business App, paired with a consented data-sharing layer that sells SME credit intelligence to licensed lenders.
We embed a lightweight POS that any kiosk can use. The merchant can:
Allow the business to tag mpesa sales by prompting the customer with an STK push directly from the app. When the customer completes payment, the merchant logs what it was for (sale of maize, stock advance, service payment).
Record cash sales with one tap, so revenue the till never sees still hits the books.
Tag every outflow. Each time the SME pays for something from the till or paybill, they log the purpose — stock, rent, supplier, salary, loan repayment.
Record existing loans taken from banks, SACCOs, or M-PESA itself, and tag each repayment as it goes out.
At the end of each day, week, or month, the system generates a simple profit and loss statement, revenue breakdown, cash flow summary, business health report, and a dynamic loan affordability amount. The merchant finally has the documents every credit committee asks for — generated as a free byproduct of running the business.



- Each app follows: `models/`, `serializers/`, `services/`, `tasks/`, `views/`, `utils/`
- Always split logic into files — do not dump everything into one file, e.g.:
  - models/
    - `__init__.py` (import * from each child file)
    - `vps.py`
    - `application.py`
  - views/
    - `__init__.py` (import * from each child file)
    - `vps.py`
    - `application.py`
    - Always add drf-spectacular documentation to all API endpoints (query parameters). Always add a unique tag to each viewset.
  - serializers/
    - `__init__.py` (import * from each child file)
    - `vps.py`
    - `application.py`

- Business logic lives in `services/` — keep views thin, avoid deeply nested logic.
- Async/background work (provisioning, deployment, agent runs) goes in `tasks/` (Celery).
- Real-time provisioning status updates via WebSocket consumers in `consumers.py`.
- Signal handlers in `signals/`.
- Always create admin classes for all models.

#### Constants -

Always store enums and constants in a constants.py for each app, unless is is a commonly used constant that is used by all apps, then you can store it in commons app.

store choices like this 

```py
class ExperienceLevel:
    ASSOCIATE = "associate"
  
    choices = [
        (ASSOCIATE, "Associate"),
       
    ]
```
## Project structure
BIASHARA-BOOKS/
├── biashara-books-backend/    # Django API
├── biashara-books-app/        # Expo App