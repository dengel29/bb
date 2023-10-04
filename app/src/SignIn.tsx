import { useRef } from "react";

const SignIn = (): JSX.Element => {
  const email = useRef<HTMLInputElement>(null);
  const submitEmail = () => {
    console.log("ANYTHUING");
    console.log(email.current?.value);
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
          // The request successfully completed and the email to the user with the
          // magic login link was sent!
          // You can now prompt the user to click on the link in their email
          // We recommend you display json.code in the UI (!) so the user can verify
          // that they're clicking on the link for their _current_ login attempt
          document.body.innerText = json.code;
        }
      });
  };
  return (
    <div>
      <h1>
        We'll send you a magic link to sign in with, please enter your email:
      </h1>
      <label htmlFor="email">Hey</label>
      <input type="text" name="email" ref={email} />
      <button onClick={() => submitEmail()}>Submit</button>
    </div>
  );
};

export default SignIn;
