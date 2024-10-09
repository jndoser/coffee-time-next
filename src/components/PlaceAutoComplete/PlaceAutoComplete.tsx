"use client";
import React, { useEffect, useState } from "react";
import { AutoComplete, Input } from "antd";
import type { AutoCompleteProps } from "antd";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useDispatch } from "react-redux";
import { setSelectedLocation } from "@/store/slicers/searchMapSlicer";

const PlaceAutoComplete: React.FC = () => {
  const map = useMap();
  const placesLibrary = useMapsLibrary("places");
  const geoCoderLibrary = useMapsLibrary("geocoding");

  const [autoCompleteService, setAutoCompleteService] =
    useState<google.maps.places.AutocompleteService>();
  const [geoCoder, setGeoCoder] = useState<google.maps.Geocoder>();

  const [inputPlace, setInputPlace] = useState("");
  const [options, setOptions] = useState<AutoCompleteProps["options"]>([]);

  const dispatch = useDispatch();

  const handleSearch = (value: string) => {
    setInputPlace(value);
  };

  const onSelect = (value: string) => {
    if (geoCoder) {
      geoCoder
        .geocode({ address: value })
        .then((response) => {
          const selectedLocation = response.results[0].geometry.location;
          dispatch(
            setSelectedLocation(
              new google.maps.LatLng(
                parseFloat(selectedLocation.lat().toString()),
                parseFloat(selectedLocation.lng().toString())
              )
            )
          );
          return response;
        })
        .then((response) => {
          const selectedLocation = response.results[0].geometry.location;
          const location = new google.maps.LatLng(
            parseFloat(selectedLocation.lat().toString()),
            parseFloat(selectedLocation.lng().toString())
          );
          console.log("location: ", location.toString());
          google.maps.places.Place.searchNearby({
            fields: ["id"],
            locationRestriction: {
              center: new google.maps.LatLng(
                parseFloat(selectedLocation.lat().toString()),
                parseFloat(selectedLocation.lng().toString())
              ),
              radius: 10000,
            },
          }).then((response) => {
            console.log(response);
          }).catch((error) => console.log(error));
        });
    }
    setInputPlace("");
  };

  useEffect(() => {
    if (!map || !placesLibrary || !geoCoderLibrary) return;
    setAutoCompleteService(new placesLibrary.AutocompleteService());
    setGeoCoder(new geoCoderLibrary.Geocoder());
  }, [map, placesLibrary, geoCoderLibrary]);

  useEffect(() => {
    if (!autoCompleteService) return;
    autoCompleteService
      .getPlacePredictions({ input: inputPlace })
      .then((response) => {
        const options = response.predictions.map(
          (prediction: google.maps.places.AutocompletePrediction) => ({
            value: prediction.description,
            label: (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{prediction.description}</span>
              </div>
            ),
          })
        );
        setOptions(options);
      });
  }, [autoCompleteService, inputPlace]);

  return (
    <AutoComplete
      popupMatchSelectWidth={252}
      style={{ width: 300, position: "absolute", top: "10px", right: "10px" }}
      options={options}
      onSelect={onSelect}
      onSearch={handleSearch}
      value={inputPlace}
      size="large"
    >
      <Input.Search
        size="large"
        placeholder="Input your place here"
        enterButton
      />
    </AutoComplete>
  );
};

export default PlaceAutoComplete;
