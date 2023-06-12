import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
//need to install dependicies
const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button className="LoginButton" onClick={() => loginWithRedirect()}>Log In</button>;
};

export default LoginButton;