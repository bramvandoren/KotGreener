import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/helper/supabaseClient';
import { Link } from 'react-router-dom';

const UserDrafts = () => {
  const [allPlants, setAllPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [session, setSession] = useState(false);
  const [editMode, setEditMode] = useState({});
  const [newPrices, setNewPrices] = useState({});

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          fetchPlants(session.user.id);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, []);

  const fetchPlants = async (userId) => {
    try {
      // Fetch drafts
      const { data: draftData, error: draftError } = await supabase
        .from('market_drafts')
        .select('*, user_plants(*, plants(*))')
        .eq('profile_id', userId);

      if (draftError) {
        console.error('Error fetching drafts:', draftError);
      }

      // Fetch plants for sale
      const { data: saleData, error: saleError } = await supabase
        .from('plants_for_sale')
        .select('*, user_plants(*, plants(*))')
        .eq('profile_id', userId);

      if (saleError) {
        console.error('Error fetching plants for sale:', saleError);
      }

      // Combine lists
      const combinedPlants = [
        ...(draftData?.map(draft => ({ ...draft, type: 'draft' })) || []),
        ...(saleData?.map(sell => ({ ...sell, type: 'te koop' })) || [])
      ];

      setAllPlants(combinedPlants);
      setFilteredPlants(combinedPlants);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    let filtered = allPlants;

    if (type !== 'all') {
      filtered = filtered.filter(plant => plant.type === type);
    }

    setFilteredPlants(filtered);
  };

  const handleSearch = () => {
    let filtered = allPlants;

    if (searchTerm) {
      filtered = filtered.filter(plant =>
        plant.user_plants.nickname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (minPrice) {
      filtered = filtered.filter(plant =>
        parseFloat(plant.price || plant.selling_price) >= parseFloat(minPrice)
      );
    }

    if (maxPrice) {
      filtered = filtered.filter(plant =>
        parseFloat(plant.price || plant.selling_price) <= parseFloat(maxPrice)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(plant => plant.type === filterType);
    }

    setFilteredPlants(filtered);
  };

  const handleEditPrice = async (plantId, newPrice) => {
    try {
      // Update de prijs in de 'plants_for_sale' tabel
      const { error: saleError } = await supabase
        .from('plants_for_sale')
        .update({ selling_price: newPrice })
        .eq('id', plantId);

      if (saleError) {
        console.error('Error updating price in plants_for_sale:', saleError);
      }

      // Update de prijs in de 'market_drafts' tabel
      const { error: draftError } = await supabase
        .from('market_drafts')
        .update({ price: newPrice })
        .eq('id', plantId);

      if (draftError) {
        console.error('Error updating price in market_drafts:', draftError);
      }

      // Werk de lokale state bij om de nieuwe prijs weer te geven
      setFilteredPlants(filteredPlants.map(plant =>
        plant.id === plantId ? { 
          ...plant, 
          user_plants: { 
            ...plant.user_plants, 
            selling_price: newPrice, 
            price: newPrice 
          }, 
          isEditing: false
        } : plant
      ));
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const toggleEdit = async (plantId) => {
    setFilteredPlants(filteredPlants.map(plant =>
      plant.id === plantId ? { 
        ...plant, 
        isEditing: !plant.isEditing,
        newPrice: plant.isEditing ? null : plant.selling_price || plant.price 
      } : plant
    ));
  };

  const toggleMarketStatus = async (plantId, userPlantId, isOnMarket) => {
    try {
      const plant = allPlants.find(p => p.id === plantId);
      if (isOnMarket) {
        // Remove from plants_for_sale
        const { error: deleteError } = await supabase
          .from('plants_for_sale')
          .delete()
          .eq('user_plant_id', userPlantId);

        if (deleteError) {
          console.error('Error deleting from plants_for_sale:', deleteError);
          return;
        }

        // Update user_plants to indicate it's not on market
        const { error: updateError } = await supabase
          .from('user_plants')
          .update({ is_on_market: false, is_draft: true })
          .eq('id', userPlantId);

        if (updateError) {
          console.error('Error updating user_plants:', updateError);
          return;
        }

        // Add to market_drafts
        const { error: insertError } = await supabase
          .from('market_drafts')
          .insert([
            {
              user_plant_id: userPlantId,
              profile_id: plant.profile_id,
              price: plant.selling_price
            }
          ]);

        if (insertError) {
          console.error('Error inserting into market_drafts:', insertError);
          return;
        }

      } else {

        // Insert into plants_for_sale
        const { error: insertError } = await supabase
          .from('plants_for_sale')
          .insert([
            {
              user_plant_id: userPlantId,
              profile_id: plant.profile_id,
              selling_price: plant.price
            }
          ]);

        if (insertError) {
          console.error('Error inserting into plants_for_sale:', insertError);
          return;
        }

        // Delete from market_drafts
        const { error: deleteError } = await supabase
          .from('market_drafts')
          .delete()
          .eq('user_plant_id', userPlantId);

        if (deleteError) {
          console.error('Error deleting from market_drafts:', deleteError);
          return;
        }

        // Update user_plants to indicate it's on market
        const { error: updateError } = await supabase
          .from('user_plants')
          .update({ is_on_market: true, is_draft:false })
          .eq('id', userPlantId);

        if (updateError) {
          console.error('Error updating user_plants:', updateError);
          return;
        }
      }

      // Delete from opposite list
      const deleteTable = isOnMarket ? 'market_drafts' : 'plants_for_sale';
      const { error: deleteError } = await supabase
        .from(deleteTable)
        .delete()
        .eq('id', plantId);

      if (deleteError) {
        console.error(`Error deleting from ${deleteTable}:`, deleteError);
        return;
      }

      // Refresh plant lists
      fetchPlants(plant.profile_id);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleDeletePlant = async (plantId, userPlantId) => {
    try {

      // Delete from market_drafts
      const {error: deleteFromDrafts} = await supabase
        .from('market_drafts')
        .delete()
        .eq('user_plant_id', userPlantId);

      // Update user_plants to indicate it's off market
      const { error: updateError } = await supabase
        .from('user_plants')
        .update({ is_on_market: false, is_draft:false })
        .eq('id', userPlantId);

      if (updateError) {
        console.error('Error updating user_plants:', updateError);
        return;
      }

      // Delete from plants_for_sale
      const {error} = await supabase
        .from('plants_for_sale')
        .delete()
        .eq('user_plant_id', userPlantId);

      if (deleteFromDrafts || error) {
        console.error('Error deleting user plant:', error || deleteFromDrafts);
      } else {
        // Refresh plant lists
        setAllPlants(allPlants.filter(p => p.user_plant_id !== userPlantId));
        setFilteredPlants(filteredPlants.filter(p => p.user_plant_id !== userPlantId));
      }
    } catch (error) {
      console.error('Unexpected error deleting plant:', error);
    }
  };


  return (
    <>
    {session ? (
    <div className="user-drafts-sell">
      <div className="filter-section">
        {/* <input
          type="text"
          placeholder="Zoek op plantnaam"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min prijs"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max prijs"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        /> */}
        {/* <button onClick={handleSearch}>Zoek</button> */}
        <div className="filter-buttons">
          <button
            className={filterType === 'all' ? 'active' : ''}
            onClick={() => handleFilterChange('all')}
          >
            Alle
          </button>
          <button
            className={filterType === 'draft' ? 'active' : ''}
            onClick={() => handleFilterChange('draft')}
          >
            Drafts
          </button>
          <button
            className={filterType === 'te koop' ? 'active' : ''}
            onClick={() => handleFilterChange('te koop')}
          >
            Te koop
          </button>
        </div>
      </div>
      <div>
        {filteredPlants.length > 0 ? (
          <div className="plants-list-market">
            {filteredPlants.map(plant => (
              <div className="plant-card-market" key={plant.id}>
                <div className="plant-card-market-image-overlay">
                  <img src={plant.user_plants.image_url} alt={plant.user_plants.nickname} />
                </div>
                <div className="plant-card-market-header">
                  <h3>{plant.user_plants.nickname}</h3>
                  <div>
                    <span className="edit-icon" 
                      onClick={() => {
                        if (plant.isEditing) {
                          handleEditPrice(plant.id, plant.newPrice);
                        } else {
                          toggleEdit(plant.id);
                        }
                      }}>
                      {plant.isEditing ? <button>Opslaan</button> :
                      <svg class="btn-edit" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7">
                        </path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z">
                        </path>
                      </svg> 
                      }
                    </span>
                    <svg onClick={() => handleDeletePlant(plant.id, plant.user_plant_id)} class="btn--delete" xmlns="http://www.w3.org/2000/svg" width="20" height="22">
                      <g fill="none" fill-rule="evenodd" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                        <path d="M1 5h18M17 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5m3 0V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M8 10v6M12 10v6"></path>
                      </g>
                      </svg>
                  </div>
                </div>
                <p>{plant.user_plants.plants ? plant.user_plants.plants.name : 'Eigen soort' }</p>
                <div className="plant-price">
                  {plant.isEditing ? (
                    <div className="edit-price">
                      <input
                        type="number"
                        value={plant.isEditing ? (plant.newPrice || '') : (plant.selling_price || plant.price)}
                        onChange={(e) => setFilteredPlants(filteredPlants.map(p =>
                          p.id === plant.id ? { ...p, newPrice: parseFloat(e.target.value) } : p
                        ))}
                      />
                    </div>
                  ) : (
                    <p>{plant.selling_price || plant.price} euro</p>
                  )}
                </div>
                <button onClick={() => toggleMarketStatus(plant.id, plant.user_plant_id, plant.user_plants.is_on_market)}>
                  {plant.user_plants.is_on_market ? 'Haal van Markt' : 'Zet op Markt'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Geen planten gevonden</p>
        )}
      </div>
    </div>
    ) : ("")}
    </>
  );
};

export default UserDrafts;
