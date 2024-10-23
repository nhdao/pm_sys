import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: "isAfter", async: false })
export class IsAfter implements ValidatorConstraintInterface {

    validate(propertyValue: string, args: ValidationArguments) {
      const referenceValue = args.object[args.constraints[0]]
      if (!referenceValue) {
        return true
      }
      return propertyValue >= referenceValue
    }

    defaultMessage(args: ValidationArguments) {
      return `${args.property} must be equal or after ${args?.constraints[0]}`;
    }
}