import { countries } from "countries-list";
import { post } from "./requests";

export function LocationGrabber({
  location,
}: {
  location?: string;
}): JSX.Element {
  const successCb: PositionCallback = async (position): Promise<string> => {
    console.log(position);
    const { coords } = position;
    const { latitude, longitude } = coords;
    const result = await post("/api/coords-to-country", true, {
      latitude,
      longitude,
    });

    console.log(result);
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successCb);
    }
  };
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <button onClick={() => handleLocationClick()}>Use my location</button> or{" "}
      <br />
      <label
        htmlFor=""
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        Select your country
        <select name="" id="">
          {Object.keys(countries).map((key, i) => {
            return <option key={i}>{countries[key].name}</option>;
          })}
        </select>
      </label>
    </div>
  );
}
