import {
    WiDaySunny,
    WiCloudy,
    WiRain,
    WiSnow,
    WiThunderstorm,
    WiFog,
} from "react-icons/wi";
import { IconType } from "react-icons";
import {JSX} from "react";

const weatherCodeMap: Record<string, IconType> = {
    "113": WiDaySunny,
    "116": WiCloudy,
    "119": WiCloudy,
    "122": WiCloudy,
    "143": WiFog,
    "176": WiRain,
    "200": WiThunderstorm,
    "260": WiFog,
    "293": WiRain,
    "296": WiRain,
    "299": WiRain,
    "302": WiRain,
    "305": WiRain,
    "308": WiRain,
    "311": WiSnow,
    "320": WiSnow,
    "323": WiSnow,
    "326": WiSnow,
    "329": WiSnow,
    "332": WiSnow,
    "335": WiSnow,
    "338": WiSnow,
    "353": WiRain,
};

export const getWeatherIcon = (code: string | undefined): JSX.Element => {
    const Icon = weatherCodeMap[code ?? ""] || WiCloudy;
    return <Icon />;
};
