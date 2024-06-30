import React, { useEffect, useState } from "react";
import "./styles/AvatarCustomizerStyles.css";
import html2canvas from "html2canvas";
import { saveAvatar, getAvatarOptions } from "../services/api";
import { Button } from "react-bootstrap";
import { updateAvatar } from "../services/auth/authSlice";
import { useAppDispatch } from "../hooks/redux/hooks";

interface AccessoryOption {
  name: string;
  image: string;
}

interface AvatarOptionProps {
  options: AccessoryOption[];
  selected: number;
  onSelect: (index: number) => void;
}

const AvatarOption: React.FC<AvatarOptionProps> = ({
  options,
  selected,
  onSelect,
}) => (
  <div className="avatar-option">
    {options.map((option, index) => (
      <div
        key={index}
        className={`option-name ${selected === index ? "selected" : ""}`}
        onClick={() => onSelect(index)}
      >
        {option.name}
      </div>
    ))}
  </div>
);

const AvatarCustomizer: React.FC = () => {
  const [selectedBackground, setSelectedBackground] = useState<number>(0);
  const [selectedGround, setSelectedGround] = useState<number>(0);
  const [selectedHandAccessory, setSelectedHandAccessory] = useState<number>(0);
  const [selectedHeadAccessory, setSelectedHeadAccessory] = useState<number>(0);
  const [selectedFeetAccessory, setSelectedFeetAccessory] = useState<number>(0);
  const [selectedMouthAccessory, setSelectedMouthAccessory] =
    useState<number>(0);
  const [selectedEyesAccessory, setSelectedEyesAccessory] = useState<number>(0);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchAvatarOptions = async () => {
      try {
        const response = await getAvatarOptions();
        if (response) {
          if (response.avatarOptions) {
            const options = response.avatarOptions.split(",").map(Number);
            setSelectedBackground(options[0]);
            setSelectedGround(options[1]);
            setSelectedHeadAccessory(options[2]);
            setSelectedFeetAccessory(options[3]);
            setSelectedEyesAccessory(options[4]);
            setSelectedHandAccessory(options[5]);
            setSelectedMouthAccessory(options[6]);
          }
        }
      } catch (error) {
        console.error("Error fetching avatar options:", error);
      }
    };

    fetchAvatarOptions();
  }, []);

  const base = { name: "Pikachu", image: "/images/avatar/base/webcachu.png" };
  const sky = { name: "Moon", image: "/images/avatar/base/moon.png" };

  const backgrounds: AccessoryOption[] = [
    { name: "Background 1", image: "/images/avatar/background/bg1.png" },
    { name: "Background 2", image: "/images/avatar/background/bg2.png" },
    { name: "Background 3", image: "/images/avatar/background/bg3.png" },
    { name: "Background 4", image: "/images/avatar/background/bg4.png" },
    { name: "Background 5", image: "/images/avatar/background/bg5.png" },
    { name: "Background 6", image: "/images/avatar/background/bg6.png" },
    { name: "Background 7", image: "/images/avatar/background/bg7.png" },
    { name: "Background 8", image: "/images/avatar/background/bg8.png" },
  ];

  const grounds: AccessoryOption[] = [
    { name: "Light", image: "/images/avatar/ground/combLight.png" },
    { name: "Dark", image: "/images/avatar/ground/combDark.png" },
  ];

  const handAccessories: AccessoryOption[] = [
    { name: "None", image: "" },
    { name: "As de corazones", image: "/images/avatar/hands/Card.png" },
    {
      name: "Charizard Baloon",
      image: "/images/avatar/hands/CharizardBaloon.png",
    },
    { name: "Elegante", image: "/images/avatar/hands/Corbata.png" },
    { name: "Boxing", image: "/images/avatar/hands/Guantes.png" },
    { name: "Master Ball", image: "/images/avatar/hands/Master.png" },
  ];

  const headAccessories: AccessoryOption[] = [
    { name: "None", image: "" },
    { name: "Christmas", image: "/images/avatar/head/Christmas.png" },
    { name: "Mew", image: "/images/avatar/head/Mew.png" },
    { name: "Party", image: "/images/avatar/head/Party.png" },
    { name: "Skull", image: "/images/avatar/head/Skull.png" },
  ];

  const feetAccessories: AccessoryOption[] = [
    { name: "None", image: "" },
    { name: "Blue Vans", image: "/images/avatar/feet/Blue.png" },
    { name: "Red Vans", image: "/images/avatar/feet/Red.png" },
  ];

  const mouthAccessories: AccessoryOption[] = [
    { name: "None", image: "" },
    { name: "Cigarrette", image: "/images/avatar/mouth/Cigarette.png" },
    { name: "Hot", image: "/images/avatar/mouth/Pintalabios.png" },
  ];

  const eyesAccessories: AccessoryOption[] = [
    { name: "None", image: "" },
    { name: "Diamond", image: "/images/avatar/eyes/Diamond.png" },
    { name: "Sharingan", image: "/images/avatar/eyes/SharinganBig.png" },
  ];

  const saveAvatarHandler = async () => {
    const avatarElement = document.querySelector(".avatar-preview");
    if (avatarElement) {
      const canvas = await html2canvas(avatarElement as HTMLElement, {
        backgroundColor: null, // Ensure the background is transparent
      });
      const image = canvas.toDataURL("image/png");

      const avatarOptions = [
        selectedBackground,
        selectedGround,
        selectedHeadAccessory,
        selectedFeetAccessory,

        selectedEyesAccessory,
        selectedHandAccessory,
        selectedMouthAccessory,
      ].join(",");

      try {
        await saveAvatar(image, avatarOptions);
        dispatch(updateAvatar(image));
      } catch (error) {
        console.error("Error saving avatar:", error);
      }
    }
  };

  return (
    <div className="avatar-customizer">
      <h2>Customize your Avatar</h2>
      <div className="avatar-container">
        <div className="avatar-preview">
          <div className="avatar-layers">
            <img
              src={backgrounds[selectedBackground].image}
              alt="Background"
              className="avatar-layer"
            />
            <img src={sky.image} alt="Sky" className="avatar-layer" />
            <img
              src={grounds[selectedGround].image}
              alt="Ground"
              className="avatar-layer"
            />
            <img src={base.image} alt="Base" className="avatar-layer" />
            {selectedHeadAccessory > 0 && (
              <img
                src={headAccessories[selectedHeadAccessory].image}
                alt="Head"
                className="avatar-layer"
              />
            )}
            {selectedFeetAccessory > 0 && (
              <img
                src={feetAccessories[selectedFeetAccessory].image}
                alt="Feet"
                className="avatar-layer"
              />
            )}

            {selectedEyesAccessory > 0 && (
              <img
                src={eyesAccessories[selectedEyesAccessory].image}
                alt="Eyes"
                className="avatar-layer"
              />
            )}
            {selectedHandAccessory > 0 && (
              <img
                src={handAccessories[selectedHandAccessory].image}
                alt="Hand"
                className="avatar-layer"
              />
            )}
            {selectedMouthAccessory > 0 && (
              <img
                src={mouthAccessories[selectedMouthAccessory].image}
                alt="Mouth"
                className="avatar-layer"
              />
            )}
          </div>
        </div>
        <div className="avatar-options">
          <h3>Ground</h3>
          <AvatarOption
            options={grounds}
            selected={selectedGround}
            onSelect={setSelectedGround}
          />
          <h3>Background</h3>
          <AvatarOption
            options={backgrounds}
            selected={selectedBackground}
            onSelect={setSelectedBackground}
          />
          <h3>Head</h3>
          <AvatarOption
            options={headAccessories}
            selected={selectedHeadAccessory}
            onSelect={setSelectedHeadAccessory}
          />
        </div>
        <div className="avatar-options">
          <h3>Hand</h3>
          <AvatarOption
            options={handAccessories}
            selected={selectedHandAccessory}
            onSelect={setSelectedHandAccessory}
          />
          <h3>Feet</h3>
          <AvatarOption
            options={feetAccessories}
            selected={selectedFeetAccessory}
            onSelect={setSelectedFeetAccessory}
          />
          <h3>Mouth</h3>
          <AvatarOption
            options={mouthAccessories}
            selected={selectedMouthAccessory}
            onSelect={setSelectedMouthAccessory}
          />
          <h3>Eyes</h3>
          <AvatarOption
            options={eyesAccessories}
            selected={selectedEyesAccessory}
            onSelect={setSelectedEyesAccessory}
          />
          <Button onClick={saveAvatarHandler}>Save Avatar</Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
