export interface Customer {
  uniqueId: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  birthDate: string;
  gender: string;
  phoneNo: string;
  street: string;
  town: string;
  city: string;
  district: string;
  postalCode: string;
  createdOn: string;
  updatedOn: string;
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  birthDate: string;
  gender: string;
  phoneNo: string;
  street: string;
  town: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  dob?: string;
  birthDate?: string;
  gender?: string;
  phoneNo?: string;
  street?: string;
  town?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}
