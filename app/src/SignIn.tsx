import { useRef, useState } from "react";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { Link } from "react-router-dom";
import { domain } from "./domain";

const SignIn = (): JSX.Element => {
  const email = useRef<HTMLInputElement>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<boolean | null>(null);
  const { currentUser, loading } = useCurrentUser();
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const submitEmail = () => {
    setInputsDisabled(true);
    setEmailError(false);
    fetch(`${domain}/auth/magiclogin`, {
      method: `POST`,
      body: JSON.stringify({
        // `destination` is required.
        destination: email.current?.value.toLowerCase(),
        // However, you can POST anything in your payload and it will show up in your verify() method
        // name: name,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setEmailSent(true);
        } else {
          setEmailError(true);
          setInputsDisabled(false);
        }
      });
  };
  return (
    <div>
      {currentUser && !loading && (
        <div>
          <h1>looks like you're signed in go forth and bingo</h1>
          <Link to="/play">Play</Link>
        </div>
      )}
      {!loading && !currentUser && (
        <div>
          <h1>
            We'll send you a magic link to sign in with, please enter your
            email:
          </h1>
          <label htmlFor="email">Email, please:</label>
          <br />
          <input
            type="email"
            name="email"
            ref={email}
            disabled={inputsDisabled}
          />
          <br />
          <br />
          <button
            onClick={() => submitEmail()}
            disabled={inputsDisabled}
            className="btn submit"
          >
            Get e-mail
          </button>
          {emailSent && (
            <h2>
              Bingo, your email has been sent to {email.current?.value}, please
              go to your inbox and click the link
            </h2>
          )}
          {emailError && (
            <h2>
              It seems the email you supplied had an issue, can you double-check
              to make sure it's correct?
            </h2>
          )}
        </div>
      )}
    </div>
  );
};

export default SignIn;
