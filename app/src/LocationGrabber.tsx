// import { countries } from "countries-list";
import { post } from "./requests";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

type Location = {
  city: {
    name: string;
    id: number;
    localName: string;
  } | null;
  country: {
    name: string;
    id: number;
    localName: string;
  } | null;
};
export function LocationGrabber({
  location,
}: {
  location?: Location;
}): JSX.Element {
  const [latLong, setLatlong] = useState<{
    lat: number | undefined;
    long: number | undefined;
  }>({ lat: undefined, long: undefined });
  const getLocation = async (): Promise<Location> => {
    if (!latLong.lat || !latLong.long) {
      throw new Error("No lat long provided");
    }

    const response = await post<Location>("/api/coords-to-country", true, {
      latitude: latLong.lat,
      longitude: latLong.long,
    });
    console.log("responsein", response);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.data.error);
    }
    // return { city: response.city, country: response.country };
  };

  const {
    data: loc,
    status: locationStatus,
    fetchStatus: locationFetchStatus,
  } = useQuery({
    queryKey: ["location", latLong.lat, latLong.long],
    queryFn: getLocation,
  });

  const successCb: PositionCallback = async (position): Promise<void> => {
    const { coords } = position;
    const { latitude, longitude } = coords;
    setLatlong({ lat: latitude, long: longitude });
  };

  const error = () => {
    alert(
      "Please go to your browser settings to turn on geolocation privileges"
    );
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    console.log(e);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successCb, error);
    } else {
      console.log("FAILED REQUEST");
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {location?.city && location?.country && (
        <div
          style={{
            border: "4px solid var(--green-7)",
            backgroundColor: "var(--green-4)",
            borderRadius: "30%",
            padding: "6px",
            fontWeight: 600,
          }}
        >
          <p>
            {location.city.name}, {location.country.name}
          </p>
        </div>
      )}
      {!location && locationFetchStatus === "idle" && !loc ? (
        <div style={{ border: "1px solid red" }}>
          <p>loading</p>
        </div>
      ) : null}
      {!location && loc?.country?.name && locationStatus === "success" ? (
        <div style={{ border: "1px solid red" }}>
          <p>
            {loc?.city?.name}, {loc?.country.name}
          </p>
        </div>
      ) : null}
      <button onClick={handleLocationClick}>
        {location?.city ? "Refetch" : "Fetch"} my location
      </button>
      {/* <label
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
      </label> */}
    </div>
  );
}
