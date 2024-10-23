import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: "isAfterNow", async: false })
export class IsAfterNow implements ValidatorConstraintInterface {

    validate(propertyValue: Date) {
        return new Date(propertyValue) > new Date()
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must be equal or after now`;
    }
}