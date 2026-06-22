class InventoryType:
    UNIT = "unit"
    COUNT = "count"

    choices = [
        (UNIT, "Unit"),
        (COUNT, "Count"),
    ]


class UnitMetric:
    KG = "kg"
    L = "l"

    choices = [
        (KG, "Kilogram (kg)"),
        (L, "Litre (l)"),
    ]
