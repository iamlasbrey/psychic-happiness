const serializeUser = (user) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    businessName: user.businessName,
    businessRegistrationNumber: user.businessRegistrationNumber,
    tin: user.tin,
  };
};

module.exports = { serializeUser };
