import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
//need to install dependencies
const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button className="LoginButton" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      Log Out
    </button>
  );
};

export default LogoutButton;
