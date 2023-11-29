import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/pokedex">Pokedex</Link>
          </li>
          {/* Agrega más enlaces según sea necesario */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
