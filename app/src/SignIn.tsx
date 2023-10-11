import { useRef, useState } from "react";

const SignIn = (): JSX.Element => {
  const email = useRef<HTMLInputElement>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<boolean | null>(null);
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const submitEmail = () => {
    console.log(email.current?.value);
    setInputsDisabled(true);
    setEmailError(false);
    fetch(`http://localhost:3000/auth/magiclogin`, {
      method: `POST`,
      body: JSON.stringify({
        // `destination` is required.
        destination: email.current?.value,
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
          // The request successfully completed and the email to the user with the
          // magic login link was sent!
          // You can now prompt the user to click on the link in their email
          // We recommend you display json.code in the UI (!) so the user can verify
          // that they're clicking on the link for their _current_ login attempt
          // document.body.innerText = json.code;
        } else {
          setEmailError(true);
          setInputsDisabled(false);
        }
      });
  };
  return (
    <div>
      <h1>
        We'll send you a magic link to sign in with, please enter your email:
      </h1>
      <label htmlFor="email">Hey</label>
      <input type="email" name="email" ref={email} disabled={inputsDisabled} />
      <button onClick={() => submitEmail()} disabled={inputsDisabled}>
        Submit
      </button>
      {emailSent && (
        <h2>
          Bingo, your email has been sent to {email.current?.value}, please go
          to your inbox and click the link
        </h2>
      )}
      {emailError && (
        <h2>
          It seems the email you supplied had an issue, can you double-check to
          make sure it's correct?
        </h2>
      )}
    </div>
  );
};

export default SignIn;
