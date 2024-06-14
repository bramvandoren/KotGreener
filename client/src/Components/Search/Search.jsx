import React, { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import PlantCard from './PlantCard';
import Navbar from '../Navbar/Navbar';
import { supabase } from '../../lib/helper/supabaseClient';
import logo from "../../assets/logo-kotgreener.svg";
import './Search.css';
import Header from '../Header/Header';

function Search() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [sunlight, setSunlight] = useState(null);
  const [size, setSize] = useState(null);
  const [care, setCare] = useState(null);
  const [extraFilters, setExtraFilters] = useState([]);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [session, setSession] = useState(null);
  const [sortOption, setSortOption] = useState('order');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };
  
  const handleClearSearch = () => {
    setQuery('');
  };

  const sunlightOptions = [
    { value: 'zonnig', label: 'Zonnig' },
    { value: 'schaduw', label: 'Schaduw' },
    { value: 'halfschaduw', label: 'Halfschaduw' },
  ];

  const sizeOptions = [
    { value: 'klein', label: 'Klein (<=15cm)' },
    { value: 'middel', label: 'Middel (15cm tem 50 cm)' },
    { value: 'groot', label: 'Groot (>50cm)' },
  ];

  const careOptions = [
    { value: 'dagelijks', label: 'Dagelijks' },
    { value: 'wekelijks', label: 'Wekelijks' },
    { value: 'tweewekelijks', label: '2-wekelijks' },
    { value: 'maandelijks', label: 'Maandelijks' },
  ];

  const extraFilterOptions = [
    { value: 'diervriendelijk', label: 'Diervriendelijk' },
    { value: 'allergie', label: 'Allergiën' },
    { value: 'kleurrijk', label: 'Kleurrijk' },
    { value: 'hangplant', label: 'Hangplanten' },
  ];

  const SVGIcons = {
    diervriendelijk: (
    <svg width="30" height="27" viewBox="0 0 30 27" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.9291 16.7267C22.4504 15.0234 21.4155 13.5213 19.9832 12.4509C18.5509 11.3804 16.8003 10.8007 15 10.8007C13.1997 10.8007 11.4491 11.3804 10.0168 12.4509C8.58448 13.5213 7.54957 15.0234 7.07083 16.7267L5.92995 20.7858C5.72511 21.5145 5.69455 22.2799 5.84065 23.0222C5.98675 23.7645 6.30557 24.4636 6.77224 25.0651C7.23891 25.6666 7.84083 26.1541 8.53106 26.4897C9.22128 26.8254 9.98117 27 10.7515 27H19.2485C20.0188 27 20.7787 26.8254 21.4689 26.4897C22.1591 26.1541 22.7611 25.6666 23.2277 25.0651C23.6944 24.4636 24.0132 23.7645 24.1593 23.0222C24.3054 22.2799 24.2749 21.5145 24.07 20.7858L22.9291 16.7267ZM21.6361 23.8753C21.3573 24.2375 20.9964 24.531 20.582 24.7325C20.1676 24.9341 19.711 25.0381 19.2485 25.0365H10.7515C10.2893 25.0365 9.83334 24.9317 9.4192 24.7303C9.00505 24.5289 8.64389 24.2364 8.36389 23.8755C8.08388 23.5146 7.89259 23.0951 7.80493 22.6498C7.71727 22.2044 7.73561 21.7451 7.85852 21.3079L8.99939 17.2489C9.3617 15.9599 10.1449 14.8232 11.2288 14.0131C12.3128 13.203 13.6376 12.7643 15 12.7643C16.3624 12.7643 17.6872 13.203 18.7711 14.0131C19.8551 14.8232 20.6383 15.9599 21.0006 17.2489L22.1415 21.3079C22.2661 21.745 22.2854 22.2046 22.1977 22.6503C22.1099 23.0959 21.9177 23.5154 21.6361 23.8755V23.8753ZM8.12898 12.1697C8.30304 11.102 8.07222 9.95908 7.47877 8.95056C6.88533 7.94203 5.99203 7.17435 4.96313 6.78845C3.86127 6.37543 2.73741 6.44121 1.79747 6.97358C-0.071077 8.03242 -0.562801 10.642 0.701551 12.7909C1.29481 13.7994 2.18816 14.5673 3.21706 14.953C3.67284 15.1273 4.15731 15.2182 4.64647 15.2212C5.25588 15.2234 5.85499 15.0669 6.38272 14.7678C7.32209 14.2354 7.9423 13.3127 8.12898 12.1697ZM6.15334 11.8594C6.06393 12.4073 5.79009 12.8362 5.38227 13.0673C4.97445 13.2984 4.45903 13.3166 3.93073 13.1187C3.32972 12.8934 2.79818 12.4283 2.43393 11.8091C1.7337 10.6187 1.90013 9.18287 2.7978 8.67407C3.02346 8.54838 3.27903 8.48364 3.53848 8.48643C3.78186 8.4889 4.02272 8.535 4.24921 8.62246C4.85022 8.84784 5.38177 9.31289 5.74602 9.93208C6.11026 10.5513 6.25487 11.2359 6.15334 11.8594ZM8.34568 8.10194C9.05604 8.65928 9.86724 8.94951 10.6876 8.94945C10.9333 8.94938 11.1783 8.92344 11.4184 8.87208C13.5268 8.42224 14.8051 6.08366 14.2681 3.65899C14.0161 2.521 13.4035 1.5226 12.5432 0.847567C11.622 0.124738 10.5308 -0.148869 9.47055 0.077429C7.36223 0.527203 6.08388 2.86578 6.62087 5.29045C6.87289 6.42851 7.48546 7.42691 8.34568 8.10194ZM9.89544 1.99618C9.99265 1.97561 10.0918 1.96532 10.1913 1.9655C10.5632 1.9655 10.9457 2.10828 11.294 2.38159C11.7964 2.77583 12.1584 3.37772 12.313 4.07643C12.6106 5.41992 12.0063 6.73752 10.9934 6.95363C10.5332 7.05181 10.0365 6.9151 9.59503 6.5686C9.09255 6.17429 8.73062 5.5724 8.57594 4.87375C8.27828 3.52989 8.88261 2.21229 9.89544 1.99618ZM28.2025 6.97358C27.2629 6.44121 26.1385 6.37543 25.0368 6.78845C24.0079 7.17423 23.1146 7.94203 22.5213 8.95056C21.9281 9.95908 21.6972 11.1023 21.8711 12.1697C22.0575 13.3127 22.6776 14.2354 23.6174 14.7678C24.1451 15.0669 24.7442 15.2234 25.3536 15.2212C25.8428 15.2182 26.3273 15.1273 26.783 14.953C27.8119 14.5673 28.7053 13.7994 29.2985 12.7909C30.5628 10.642 30.071 8.03242 28.2025 6.97358ZM27.566 11.8091C27.2018 12.4283 26.6702 12.8934 26.0692 13.1187C25.5412 13.3167 25.0256 13.2985 24.6178 13.0673C24.21 12.8361 23.9364 12.4073 23.8468 11.8594C23.7451 11.2359 23.8896 10.5515 24.254 9.93264C24.6183 9.31375 25.1497 8.84839 25.7508 8.62301C25.9772 8.53547 26.2181 8.48929 26.4615 8.48673C26.7209 8.48394 26.9765 8.54869 27.2022 8.67437C28.0998 9.18275 28.2665 10.6184 27.566 11.8091ZM18.5816 8.87208C18.8217 8.92344 19.0667 8.94938 19.3124 8.94945C20.1327 8.94945 20.9442 8.65928 21.6543 8.10194C22.5145 7.42697 23.1271 6.42851 23.3791 5.29051C23.9161 2.86584 22.6377 0.527264 20.5294 0.0774903C19.4693 -0.148685 18.378 0.124738 17.4567 0.847629C16.5964 1.5226 15.9839 2.52106 15.7319 3.65899C15.1949 6.08366 16.4732 8.42224 18.5816 8.87208ZM17.6869 4.07612C17.8416 3.37741 18.2035 2.77528 18.706 2.38128C19.0544 2.10798 19.4368 1.96519 19.8087 1.96519C19.9081 1.96501 20.0073 1.9753 20.1045 1.99587C21.1174 2.21198 21.7217 3.52989 21.4242 4.87308C21.2694 5.57179 20.9074 6.17392 20.4051 6.56798C19.9636 6.91443 19.4673 7.05114 19.0067 6.95302C17.9937 6.73722 17.3893 5.41943 17.6869 4.07612Z" fill="black"/>
    </svg>
    ),
    allergie: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.1875 4.6875H17.8125C18.0611 4.6875 18.2996 4.78627 18.4754 4.96209C18.6512 5.1379 18.75 5.37636 18.75 5.625V7.5H11.25V5.625C11.25 5.37636 11.3488 5.1379 11.5246 4.96209C11.7004 4.78627 11.9389 4.6875 12.1875 4.6875ZM9.375 5.625V7.5H7.03125C5.91237 7.5 4.83931 7.94447 4.04814 8.73564C3.25697 9.52681 2.8125 10.5999 2.8125 11.7188V22.0312C2.8125 23.1501 3.25697 24.2232 4.04814 25.0144C4.83931 25.8055 5.91237 26.25 7.03125 26.25H22.9688C24.0876 26.25 25.1607 25.8055 25.9519 25.0144C26.743 24.2232 27.1875 23.1501 27.1875 22.0312V11.7188C27.1875 10.5999 26.743 9.52681 25.9519 8.73564C25.1607 7.94447 24.0876 7.5 22.9688 7.5H20.625V5.625C20.625 4.87908 20.3287 4.16371 19.8012 3.63626C19.2738 3.10882 18.5584 2.8125 17.8125 2.8125H12.1875C11.4416 2.8125 10.7262 3.10882 10.1988 3.63626C9.67132 4.16371 9.375 4.87908 9.375 5.625ZM22.9688 9.375C23.5904 9.375 24.1865 9.62193 24.626 10.0615C25.0656 10.501 25.3125 11.0971 25.3125 11.7188V22.0312C25.3125 22.6529 25.0656 23.249 24.626 23.6885C24.1865 24.1281 23.5904 24.375 22.9688 24.375H7.03125C6.40965 24.375 5.81351 24.1281 5.37397 23.6885C4.93443 23.249 4.6875 22.6529 4.6875 22.0312V11.7188C4.6875 11.0971 4.93443 10.501 5.37397 10.0615C5.81351 9.62193 6.40965 9.375 7.03125 9.375H22.9688ZM15 13.125C15.2486 13.125 15.4871 13.2238 15.6629 13.3996C15.8387 13.5754 15.9375 13.8139 15.9375 14.0625V15.9375H17.8125C18.0611 15.9375 18.2996 16.0363 18.4754 16.2121C18.6512 16.3879 18.75 16.6264 18.75 16.875C18.75 17.1236 18.6512 17.3621 18.4754 17.5379C18.2996 17.7137 18.0611 17.8125 17.8125 17.8125H15.9375V19.6875C15.9375 19.9361 15.8387 20.1746 15.6629 20.3504C15.4871 20.5262 15.2486 20.625 15 20.625C14.7514 20.625 14.5129 20.5262 14.3371 20.3504C14.1613 20.1746 14.0625 19.9361 14.0625 19.6875V17.8125H12.1875C11.9389 17.8125 11.7004 17.7137 11.5246 17.5379C11.3488 17.3621 11.25 17.1236 11.25 16.875C11.25 16.6264 11.3488 16.3879 11.5246 16.2121C11.7004 16.0363 11.9389 15.9375 12.1875 15.9375H14.0625V14.0625C14.0625 13.8139 14.1613 13.5754 14.3371 13.3996C14.5129 13.2238 14.7514 13.125 15 13.125Z" fill="black"/>
      </svg>
    ),
    kleurrijk: (
      <svg width="30" height="30" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.46475 4.23077L5.35181 7.10974C5.03335 7.61434 4.80169 8.16881 4.66651 8.75H0.555913C0.779969 7.10109 1.43885 5.5411 2.46475 4.23077ZM8.75 4.67511C8.1697 4.80813 7.61569 5.03728 7.11097 5.35304L4.23077 2.46475C5.5411 1.43885 7.10109 0.779969 8.75 0.555913V4.67511ZM12.9496 5.34329C12.4314 4.99553 11.8561 4.74124 11.25 4.59208V0.553451C12.9175 0.772317 14.4958 1.43569 15.819 2.47385L12.9496 5.34329ZM0.552994 11.3H4.67511C4.80796 11.8795 5.03667 12.4328 5.35178 12.937L2.42934 15.819C1.41514 14.5053 0.767582 12.9457 0.552994 11.3ZM4.23077 17.5353L7.10974 14.6482C7.61434 14.9667 8.16881 15.1983 8.75 15.3335V19.4441C7.10109 19.22 5.5411 18.5611 4.23077 17.5353ZM15.3249 8.75C15.1916 8.16873 14.9619 7.61383 14.6454 7.10843L17.4849 4.23658C18.4967 5.54913 19.1427 7.10666 19.357 8.75H15.3249ZM11.3 19.357V15.3249C11.8813 15.1916 12.4362 14.9619 12.9416 14.6454L15.8134 17.485C14.5009 18.4967 12.9433 19.1427 11.3 19.357ZM17.5261 15.819L14.647 12.9399C14.9729 12.4205 15.2069 11.8488 15.3387 11.25H19.4466C19.2277 12.9175 18.5643 14.4958 17.5261 15.819Z" stroke="black"/>
      </svg>
    ),
    hangplant: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 -2.23315e-06L15 16M15 15L15 9M15 15C15 17.1217 15.8429 19.1566 17.3431 20.6569C18.8434 22.1571 20.8783 23 23 23L29 23L29 17C29 14.8783 28.1571 12.8434 26.6569 11.3431C25.1566 9.84285 23.1217 9 21 9L15 9M15 15L9 15C6.87827 15 4.84344 15.8429 3.34315 17.3431C1.84286 18.8434 1 20.8783 1 23L1 29L7 29C9.12173 29 11.1566 28.1571 12.6569 26.6569C14.1571 25.1566 15 23.1217 15 21L15 15ZM15 15L7 23M15 9L23 17" stroke="black"/>
      </svg>
    ),
  };

  const filterResults = (plants) => {
    let filteredResults = plants.filter((plant) =>
      plant.name.toLowerCase().includes(query.toLowerCase())
    );

    if (category) {
      filteredResults = filteredResults.filter((plant) =>
        plant.category.includes(category.value)
      );
    }

    if (sunlight) {
      filteredResults = filteredResults.filter((plant) => {
        if (sunlight.value === 'zonnig') return plant.sunlight === 'zonnig';
        if (sunlight.value === 'schaduw') return plant.sunlight === 'schaduw';
        if (sunlight.value === 'halfschaduw') return plant.sunlight == 'halfschaduw';
        return true;
    });
    }

    if (size) {
      filteredResults = filteredResults.filter((plant) => {
        if (size.value === 'klein') return plant.height <= 15;
        if (size.value === 'middel') return plant.height > 15 && plant.height <= 50;
        if (size.value === 'groot') return plant.height > 50;
        return true;
      });
    }

    if (care) {
      filteredResults = filteredResults.filter((plant) => {
        if (care.value === 'dagelijks') return plant.water_frequency === 'dagelijks';
        if (care.value === 'wekelijks') return plant.water_frequency === 'wekelijks';
        if (care.value === 'tweewekelijks') return plant.water_frequency === 'tweewekeliiks';
        if (care.value === 'maandelijks') return plant.water_frequency === 'maandelijks';
        return true;
      });
    }

    

    if (extraFilters.length > 0) {
      filteredResults = filteredResults.filter((plant) => {
        return extraFilters.every(filter => plant[filter]);
      });
    }

    setResults(filteredResults);
  };

  useEffect(() => {
    const fetchSessionAndUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        // Nu kunnen we fetchFavorites aanroepen nadat de sessie is ingesteld
        fetchFavorites(session);
      } catch (error) {
        console.error('Error fetching session or user:', error);
      }
    };
    const fetchPlants = async () => {
      try {
        const { data: plants, error } = await supabase
          .from('plants')
          .select('*');

        if (error) {
          throw new Error('Failed to fetch plants');
        }

        filterResults(plants);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSessionAndUser();
    fetchPlants();
  }, [query, category, sunlight, size, care, extraFilters]);

  const fetchFavorites = async (session) => {
    try {
      const { data: favoritePlants, error } = await supabase
        .from('favorites')
        .select('plant_id')
        .eq('profile_id', session.user.id);

      if (error) {
        throw new Error('Failed to fetch favorites');
      }

      setFavorites(favoritePlants.map(fav => fav.plant_id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleFavorite = async (plantId) => {
    if (!session) return;
    const userId = session.user.id;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ profile_id: userId, plant_id: plantId }]);

      if (error) {
        throw new Error('Failed to add favorite');
      }

      setFavorites([...favorites, plantId]);
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const handleUnfavorite = async (plantId) => {
    if (!session) return;
    const userId = session.user.id;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('profile_id', userId)
        .eq('plant_id', plantId);

      if (error) {
        throw new Error('Failed to remove favorite');
      }

      setFavorites(favorites.filter((id) => id !== plantId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleFilterRemove = (filterType) => {
    switch (filterType) {
      case 'category':
        setCategory(null);
        break;
      case 'sunlight':
        setSunlight(null);
        break;
      case 'size':
        setSize(null);
        break;
      case 'care':
        setCare(null);
        break;
      default:
        break;
    }
  };

  const handleExtraFilterClick = (filter) => {
    if (extraFilters.includes(filter.value)) {
      setExtraFilters(extraFilters.filter(f => f !== filter.value));
    } else {
      setExtraFilters([...extraFilters, filter.value]);
    }
  };

  // Sorteer de plantenlijst op basis van de geselecteerde optie
  const sortPlants = (plants, option) => {
    switch (option) {
      case 'name':
        return plants.sort((a, b) => a.name.localeCompare(b.name));
      case 'sunlight':
        return plants.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
      case 'height':
        return plants.sort((a, b) => (b.plants ? b.plants.height : b.height ) - (a.plants ? a.plants.height : a.height));

      default:
        return plants;
    }
  };

  // Sorteer de planten voordat ze worden weergegeven
  const sortedPlants = sortPlants([...results], sortOption);

  return (
    <>
      <div className="search-page">
        <Header/>
        <div className="search-intro">
          <Link className="breadcrumb">Planten zoeken</Link>
          <div className="search-intro-header">
            <h2>Planten zoeken</h2>
          </div>
          <p className="search-intro-text">Zoek nu jouw perfecte plant voor op kot. Pas aan naar jouw persoonlijke keuze(s) en ontdek.
          </p>
        </div>
        <div className="filter">
          <div className="search-input">
            <input
              type="text"
              placeholder="Zoek een plant"
              value={query}
              onChange={handleSearch}
              className="input-search-icon"
            />
            {query ? (
            <svg className="clear-icon" onClick={handleClearSearch} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.875 7.125L7.125 16.875M7.125 7.125L16.875 16.875" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ) : (<></>)}
            <svg className="search-icon" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.875 21.875L15.625 15.625M3.125 10.4167C3.125 11.3742 3.3136 12.3224 3.68005 13.2071C4.04649 14.0917 4.58359 14.8956 5.26068 15.5727C5.93777 16.2497 6.7416 16.7868 7.62627 17.1533C8.51093 17.5197 9.45911 17.7083 10.4167 17.7083C11.3742 17.7083 12.3224 17.5197 13.2071 17.1533C14.0917 16.7868 14.8956 16.2497 15.5727 15.5727C16.2497 14.8956 16.7868 14.0917 17.1533 13.2071C17.5197 12.3224 17.7083 11.3742 17.7083 10.4167C17.7083 9.45911 17.5197 8.51093 17.1533 7.62627C16.7868 6.7416 16.2497 5.93777 15.5727 5.26068C14.8956 4.58359 14.0917 4.04649 13.2071 3.68004C12.3224 3.3136 11.3742 3.125 10.4167 3.125C9.45911 3.125 8.51093 3.3136 7.62627 3.68004C6.7416 4.04649 5.93777 4.58359 5.26068 5.26068C4.58359 5.93777 4.04649 6.7416 3.68005 7.62627C3.3136 8.51093 3.125 9.45911 3.125 10.4167Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="dropdowns">
            <Select
              options={sunlightOptions}
              placeholder="Hoeveelheid Zonlicht"
              value={sunlight}
              onChange={setSunlight}
              className="dropdown"
            />
            <Select
              options={sizeOptions}
              placeholder="Grootte Plant"
              value={size}
              onChange={setSize}
              className="dropdown"
            />
            <Select
              options={careOptions}
              placeholder="Hoeveelheid Verzorging"
              value={care}
              onChange={setCare}
              className="dropdown"
            />
          </div>
          <div className="filter-more">
            <div className="filter-more">
            <div className="filter-more-header" onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}>
              <p>Meer eigenschappen</p>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                <path d={isMoreFiltersOpen ? "M16 22a2 2 0 0 1-1.41-.59l-10-10a2 2 0 0 1 2.82-2.82L16 17.17l8.59-8.58a2 2 0 0 1 2.82 2.82l-10 10A2 2 0 0 1 16 22Z" : "M16 10a2 2 0 0 1 1.41.59l10 10a2 2 0 0 1-2.82 2.82L16 14.83l-8.59 8.58a2 2 0 0 1-2.82-2.82l10-10A2 2 0 0 1 16 10Z"}></path>
              </svg>
            </div>
            {isMoreFiltersOpen && (
              <div className="filter-more-others">
                {extraFilterOptions.map(filter => (
                  <div
                    key={filter.value}
                    className={`filter-item ${extraFilters.includes(filter.value) ? 'selected' : ''}`}
                    onClick={() => handleExtraFilterClick(filter)}
                  >
                    {SVGIcons[filter.value]}
                    <p>{filter.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
        <div className="selected-filters">
          {category && (
            <button className="filter-button" onClick={() => handleFilterRemove('category')}>
              {category.label} ✕
            </button>
          )}
          {sunlight && (
            <button className="filter-button" onClick={() => handleFilterRemove('sunlight')}>
              {sunlight.label} ✕
            </button>
          )}
          {size && (
            <button className="filter-button" onClick={() => handleFilterRemove('size')}>
              {size.label} ✕
            </button>
          )}
          {care && (
            <button className="filter-button" onClick={() => handleFilterRemove('care')}>
              {care.label} ✕
            </button>
          )}
          {extraFilters.map(filter => (
            <button key={filter} className="filter-button" onClick={() => handleExtraFilterClick({ value: filter })}>
              {extraFilterOptions.find(f => f.value === filter)?.label} ✕
            </button>
          ))}
        </div>
        <div className='filters-extra'>
        <div className="results-count">
          {results.length > 0 ? (
            <p>{results.length} plant{results.length > 1 ? 'en' : ''} gevonden</p>
          ) : (
            <p>0 planten gevonden</p>
          )}
        </div>
        <div className="sort-options">
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option disabled defaultValue value="order">Sorteer op</option>
            <option value="name">Naam</option>
            <option value="sunlight">Zonlicht</option>
            <option value="water">Water</option>
            <option value="height">Grootte</option>
          </select>
        </div>
        {/* <button>Meer Filters</button> */}
      </div>
      <div className="results">
        {sortedPlants.length > 0 ? (
          sortedPlants.map((plant) => (
            <PlantCard
              key={plant.id} 
              plant={plant}
              isFavorite={session && favorites.includes(plant.id)}
              onFavorite={handleFavorite}
              onUnfavorite={handleUnfavorite}
              session={session}
            />
          ))
        ) : (
          <p className="no-results">Er zijn geen resultaten voor uw zoekopdracht.</p>
        )}
      </div>
      </div>
      <Navbar />
    </>
  );
}

export default Search;
