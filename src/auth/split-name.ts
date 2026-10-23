// "Joanna van der Berg" -> { firstName: "Joanna", lastName: "van der Berg" }.
export function splitName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName: firstName ?? "", lastName: rest.join(" ") };
}
