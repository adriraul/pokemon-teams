import { useEffect, useState } from "react";
import { Accessories, getUserAccessories } from "../services/api";

const useAccessories = () => {
  const [accessories, setAccessories] = useState<Accessories | null>(null);

  useEffect(() => {
    const fetchAccessoryData = async () => {
      try {
        const response = await getUserAccessories();
        if (response) {
          const parsedAccessories = JSON.parse(response);
          setAccessories(parsedAccessories);
        }
      } catch (error) {
        console.error("Error fetching accessory data:", error);
      }
    };

    fetchAccessoryData();
  }, []);

  return accessories;
};

export default useAccessories;
