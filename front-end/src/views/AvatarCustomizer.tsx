import React, { useEffect, useState } from "react";
import "./styles/AvatarCustomizerStyles.css";
import html2canvas from "html2canvas";
import { saveAvatar, getAvatarOptions } from "../services/api";
import { Button, Modal } from "react-bootstrap";
import { setIsLoading, updateAvatar } from "../services/auth/authSlice";
import { useAppDispatch } from "../hooks/redux/hooks";
import useAccessories from "../hooks/useAccessories";

interface AccessoryOption {
  id: string;
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
  const [isAvatarLoaded, setIsAvatarLoaded] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [benefits, setBenefits] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const accessories = useAccessories();

  const base = { name: "Pikachu", image: "/images/avatar/base/webcachu.png" };
  const sky = { name: "Moon", image: "/images/avatar/base/moon.png" };

  const backgrounds: AccessoryOption[] = [
    {
      id: "background1",
      name: "Background 1",
      image: "/images/avatar/background/bg1.png",
    },
    {
      id: "background2",
      name: "Background 2",
      image: "/images/avatar/background/bg2.png",
    },
    {
      id: "background3",
      name: "Background 3",
      image: "/images/avatar/background/bg3.png",
    },
    {
      id: "background4",
      name: "Background 4",
      image: "/images/avatar/background/bg4.png",
    },
    {
      id: "background5",
      name: "Background 5",
      image: "/images/avatar/background/bg5.png",
    },
    {
      id: "background6",
      name: "Background 6",
      image: "/images/avatar/background/bg6.png",
    },
    {
      id: "background7",
      name: "Background 7",
      image: "/images/avatar/background/bg7.png",
    },
    {
      id: "background8",
      name: "Background 8",
      image: "/images/avatar/background/bg8.png",
    },
  ];

  const grounds: AccessoryOption[] = [
    {
      id: "light",
      name: "Light",
      image: "/images/avatar/ground/combLight.png",
    },
    { id: "dark", name: "Dark", image: "/images/avatar/ground/combDark.png" },
  ];

  const allHandAccessories: AccessoryOption[] = [
    { id: "none", name: "None", image: "" },
    {
      id: "aceOfHearts",
      name: "As de corazones",
      image: "/images/avatar/hands/Card.png",
    },
    {
      id: "charizardBalloon",
      name: "Charizard Baloon",
      image: "/images/avatar/hands/CharizardBaloon.png",
    },
    {
      id: "elegant",
      name: "Elegante",
      image: "/images/avatar/hands/Corbata.png",
    },
    {
      id: "boxingGloves",
      name: "Boxing",
      image: "/images/avatar/hands/Guantes.png",
    },
    {
      id: "masterBall",
      name: "Master Ball",
      image: "/images/avatar/hands/Master.png",
    },
  ];

  const allHeadAccessories: AccessoryOption[] = [
    { id: "none", name: "None", image: "" },
    {
      id: "christmas",
      name: "Christmas",
      image: "/images/avatar/head/Christmas.png",
    },
    { id: "mew", name: "Mew", image: "/images/avatar/head/Mew.png" },
    { id: "party", name: "Party", image: "/images/avatar/head/Party.png" },
    { id: "skull", name: "Skull", image: "/images/avatar/head/Skull.png" },
  ];

  const allFeetAccessories: AccessoryOption[] = [
    { id: "none", name: "None", image: "" },
    {
      id: "blueVans",
      name: "Blue Vans",
      image: "/images/avatar/feet/Blue.png",
    },
    { id: "redVans", name: "Red Vans", image: "/images/avatar/feet/Red.png" },
  ];

  const allMouthAccessories: AccessoryOption[] = [
    { id: "none", name: "None", image: "" },
    {
      id: "cigarrette",
      name: "Cigarette",
      image: "/images/avatar/mouth/Cigarette.png",
    },
    { id: "hot", name: "Hot", image: "/images/avatar/mouth/Pintalabios.png" },
  ];

  const allEyesAccessories: AccessoryOption[] = [
    { id: "none", name: "None", image: "" },
    {
      id: "diamond",
      name: "Diamond",
      image: "/images/avatar/eyes/Diamond.png",
    },
    {
      id: "sharingan",
      name: "Sharingan",
      image: "/images/avatar/eyes/SharinganBig.png",
    },
  ];

  const handAccessories = allHandAccessories.filter((accessory) =>
    accessories?.handAccessories.some(
      (a) => a.id === accessory.id && a.unlocked === 1
    )
  );

  const headAccessories = allHeadAccessories.filter((accessory) =>
    accessories?.headAccessories.some(
      (a) => a.id === accessory.id && a.unlocked === 1
    )
  );

  const feetAccessories = allFeetAccessories.filter((accessory) =>
    accessories?.feetAccessories.some(
      (a) => a.id === accessory.id && a.unlocked === 1
    )
  );

  const mouthAccessories = allMouthAccessories.filter((accessory) =>
    accessories?.mouthAccessories.some(
      (a) => a.id === accessory.id && a.unlocked === 1
    )
  );

  const eyesAccessories = allEyesAccessories.filter((accessory) =>
    accessories?.eyesAccessories.some(
      (a) => a.id === accessory.id && a.unlocked === 1
    )
  );

  const calculateBenefits = () => {
    const selectedBenefits: string[] = [];

    if (handAccessories[selectedHandAccessory]?.id === "masterBall") {
      selectedBenefits.push(
        "When opening Pokeballs, you won't receive duplicates."
      );
    }
    if (eyesAccessories[selectedEyesAccessory]?.id === "sharingan") {
      selectedBenefits.push("Critical hit chance increased by 5%.");
    }
    if (headAccessories[selectedHeadAccessory]?.id === "mew") {
      selectedBenefits.push(
        "You will always be faster in a same-level matchup."
      );
    }

    setBenefits(selectedBenefits);
  };

  useEffect(() => {
    calculateBenefits();
  }, [selectedHandAccessory, selectedEyesAccessory, selectedHeadAccessory]);

  useEffect(() => {
    const fetchAvatarOptions = async () => {
      try {
        const response = await getAvatarOptions();

        if (response) {
          const options = response;

          const backgroundIndex =
            backgrounds.findIndex((bg) => bg.id === options.background) || 0;
          const groundIndex =
            grounds.findIndex((g) => g.id === options.ground) || 0;
          const headIndex =
            headAccessories.findIndex((a) => a.id === options.head) || 0;
          const feetIndex =
            feetAccessories.findIndex((a) => a.id === options.feet) || 0;
          const eyesIndex =
            eyesAccessories.findIndex((a) => a.id === options.eyes) || 0;
          const handIndex =
            handAccessories.findIndex((a) => a.id === options.hand) || 0;
          const mouthIndex =
            mouthAccessories.findIndex((a) => a.id === options.mouth) || 0;

          setSelectedBackground(backgroundIndex >= 0 ? backgroundIndex : 0);
          setSelectedGround(groundIndex >= 0 ? groundIndex : 0);
          setSelectedHeadAccessory(headIndex >= 0 ? headIndex : 0);
          setSelectedFeetAccessory(feetIndex >= 0 ? feetIndex : 0);
          setSelectedEyesAccessory(eyesIndex >= 0 ? eyesIndex : 0);
          setSelectedHandAccessory(handIndex >= 0 ? handIndex : 0);
          setSelectedMouthAccessory(mouthIndex >= 0 ? mouthIndex : 0);

          setIsAvatarLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching avatar options:", error);
      }
    };
    if (!isAvatarLoaded) {
      fetchAvatarOptions();
    }
  }, [
    handAccessories,
    headAccessories,
    feetAccessories,
    eyesAccessories,
    mouthAccessories,
  ]);

  const saveAvatarHandler = async () => {
    if (
      eyesAccessories[selectedEyesAccessory]?.id === "sharingan" &&
      headAccessories[selectedHeadAccessory]?.id === "mew"
    ) {
      setShowModal(true);
      return;
    }

    const avatarElement = document.querySelector(".avatar-preview");
    if (avatarElement) {
      const canvas = await html2canvas(avatarElement as HTMLElement, {
        backgroundColor: null,
      });
      const image = canvas.toDataURL("image/png");

      const avatarOptions = {
        background: backgrounds[selectedBackground].id,
        ground: grounds[selectedGround].id,
        head: headAccessories[selectedHeadAccessory]?.id || "none",
        feet: feetAccessories[selectedFeetAccessory]?.id || "none",
        eyes: eyesAccessories[selectedEyesAccessory]?.id || "none",
        hand: handAccessories[selectedHandAccessory]?.id || "none",
        mouth: mouthAccessories[selectedMouthAccessory]?.id || "none",
      };

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
          {benefits.length > 0 && (
            <ul>
              {benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          )}
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

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Conflict Detected</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            You cannot use "Sharingan" and "Mew" together. Please select only
            one.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
