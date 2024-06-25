import React, { useState, useEffect } from "react";
import { getUserBoxes } from "../services/api";
import Box from "../components/Box";
import { BoxData } from "../services/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setIsLoading } from "../services/auth/authSlice";
import { Button, Container } from "react-bootstrap";
import Loader from "../components/Loader";

const Boxes: React.FC = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const [refetch, setRefetch] = useState(false);

  const [boxes, setBoxes] = useState<BoxData[]>([]);
  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setIsLoading(true));
        const boxesData = await getUserBoxes();

        if (boxesData) setBoxes(boxesData);
        dispatch(setIsLoading(false));
      } catch (error) {
        // Manejar error si es necesario
      } finally {
      }
    };

    fetchData();
  }, [dispatch, refetch]);

  const onRefetch = () => setRefetch((prev) => !prev);

  const handlePrevBox = () => {
    setCurrentBoxIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNextBox = () => {
    setCurrentBoxIndex((prevIndex) =>
      Math.min(boxes.length - 1, prevIndex + 1)
    );
  };

  return (
    <div>
      <Container className="mt-3 bg-dark text-light rounded">
        <div className="pt-4 d-flex flex-column align-items-center mb-3">
          <div className="d-flex justify-content-between w-100 mb-2">
            <Button
              variant="secondary"
              onClick={handlePrevBox}
              disabled={currentBoxIndex === 0}
              className="me-2"
            >
              Anterior
            </Button>
            <h2>{boxes[currentBoxIndex]?.name}</h2>
            <Button
              variant="secondary"
              onClick={handleNextBox}
              disabled={currentBoxIndex === boxes.length - 1}
              className="ms-2"
            >
              Siguiente
            </Button>
          </div>
        </div>
        {isLoading && <Loader />}
        {boxes.length > 0 ? (
          <Box
            boxId={boxes[currentBoxIndex]?.id}
            boxName={boxes[currentBoxIndex]?.name}
            trainerPokemons={boxes[currentBoxIndex]?.trainerPokemons}
            onRefetch={onRefetch}
          />
        ) : (
          <p>No hay cajas disponibles</p>
        )}
      </Container>
    </div>
  );
};

export default Boxes;
