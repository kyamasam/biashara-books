class InstitutionType:
    CHAMA = "chama"
    BANK = "bank"
    SACCO = "sacco"
    LOAN_APPS = "loan_apps"
    OTHERS = "others"

    choices = [
        (CHAMA, "Chama"),
        (BANK, "Bank"),
        (SACCO, "Sacco"),
        (LOAN_APPS, "Loan Apps"),
        (OTHERS, "Others"),
    ]
