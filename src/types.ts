interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

interface UserData {
    _id: string;
    name: string;
    email: string;
    addresses: Address[];
  }


export type { Address , UserData };
