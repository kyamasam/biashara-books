Project "Daily Wage Management System" {
database_type: 'PostgreSQL'
Note: 'Database schema for a daily wage and site management application based on user stories.'
}

// Enums for clarity and data validation
Enum WorkerStatus {
Active
Deactivated
}

Enum WithdrawalStatus {
Pending
Approved
Rejected
}

Enum PaymentType {
MPesa
Cash
}

Enum UserType {
WageWorker
SiteManager
SystemAdmin
}

Enum TransactionType {
Withdrawal
FoodDeduction
InterestRateDeduction
Disbursement
}

// Core entities representing the roles
Table user {
id int [pk, increment]
name varchar
phone_number varchar [unique, not null]
created_at timestamp
user_type UserType [default: 'WageWorker']
}
// created by default when a user is created
Table wallet {
id int [pk, increment]
user int [not null, ref: > user.id] // one to one
balance decimal [default: 0.00]
pending_accrued_balance decimal [default: 0.00]
all_time_accrued_balance decimal [default: 0.00]
}

Table sites {
id int [pk, increment]
name varchar [not null]
location varchar
daily_wage_rate decimal [not null]
created_at timestamp
}

Table site_managers {
id int [pk, increment]
user int [not null, ref: > user.id]
site int [not null, ref: > sites.id]
}

Table menu {
id int [pk, increment]
}

Table dish {
id int [pk, increment]
name varchar
cost decimal
menu int [ref: > menu.id]
}

Table food_purchases{
id int pk
user_id int [ref:> user.id]
total_purchased decimal
is_paid boolean // default - false
served_by int [ref:> user.id]
}
Table food_purchase_item{
id int pk
food_purchase_id int [ref:>food_purchases.id]
dish_id int [ref:>dish.id]
amount_charged decimal

}

// Transactional & Ledger tables
Table attendance_records {
id int [pk, increment]
user int [not null, ref: > user.id]
site_id int [not null, ref: > sites.id]
date date [not null]
is_present boolean [not null]
amount_accrued decimal
}

Table accrual{
id int pk
amount_accrued decimal
accrued_at datetime
// pending_accrued_balance
pending_accrued_balance_before decimal
pending_accrued_balance_after decimal
executed boolean // default -> false
user_id int [ref:>user.id]
wallet_id int [ref:>wallet.id]
}
// disbursement is the process of taking all
// amounts in the pending_accrued_balance
// to the wallet balance
// during this process, a transaction is
// created of type Disbursement
Table disbursement{
id int pk
disbursed_by int [ref:>user.id]
total_amount_disbursed decimal
disbursement_time datetime
site_id int [ref:> sites.id]
}

Table disbursement_detail{
id int pk
// the user receiving the cash
in_favor_of_user_id int [ref:> user.id]
//wallet receiving the cash
in_favor_of_wallet_id int [ref:> wallet.id]
amount decimal
transaction_id int [ref:>transactions.id]
wallet_balance_before decimal
wallet_balance_after decimal
}

Table transactions {
id int [pk, increment]
wallet int [not null, ref: > wallet.id]
amount decimal [not null]
status WithdrawalStatus [default: 'Pending']
payment_method PaymentType [not null]
transaction_type TransactionType

wallet_balance_before decimal
wallet_balance_after decimal
narration text
requested_at timestamp [not null]
}

// a loan is paid once money enters the account.
// loans are paid in a first in first out manner
// each timne a loan is paid, a loan repayment is
// created. a loan payment is created
Table loan {
id int [pk, increment]
user_id int [ref: > user.id]
amount_requested decimal
interest_amount decimal
interest_rate float
amount_paid decimal // every time a loan payment is done, this figure increases
amount_due decimal
requested_date datetime
paid_at datetime
is_paid boolean
}
Table loan_payment{
id int [pk, increment]
amount decimal
// this is the transaction log that is being used to pay off the loan
// it is essential a deduction from the wallet indicating
// payment towards loan x
base_transaction_id int [ref:>transactions.id]

payment_method loan_payment_methods
date_paid datetime
user int [ref:> user.id]
}

Enum loan_payment_methods{
mpesa
automatic_deduction
}
