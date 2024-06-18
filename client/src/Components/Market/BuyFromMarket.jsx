// import React, { useState, useEffect } from 'react';
// import { supabase } from '../../lib/helper/supabaseClient';
// import { Link } from 'react-router-dom';

// const BuyFromMarket = () => {
//   const [listings, setListings] = useState([]);

//   useEffect(() => {
//     fetchListings();
//   }, []);

//   const fetchListings = async () => {
//     const { data, error } = await supabase
//       .from('market_listings')
//       .select('*')
//       .eq('status', 'available');

//     if (!error) {
//       setListings(data);
//     }
//   };

//   const buyPlant = async (listingId, price) => {
//     const { error } = await supabase
//       .from('market_listings')
//       .update({ status: 'sold' })
//       .eq('id', listingId);

//     if (!error) {
//       alert(`Plant gekocht voor €${price}`);
//       fetchListings(); // Update de lijst van beschikbare listings na aankoop
//     }
//   };

//   return (
//     <div className="buy-from-market">
//       <div className="breadcrumb">
//         <Link to={'/markt'}>Studenten Markt</Link>
//         <span> / </span>
//         <Link>Kopen</Link>
//       </div>
//       <h2>Koop Planten van de Markt</h2>
//       {listings.length > 0 ? (
//         <ul>
//           {listings.map((listing) => (
//             <li key={listing.id}>
//               <p>{listing.plant_name}</p>
//               <p>Prijs: {listing.price}</p>
//               <button onClick={() => buyPlant(listing.id, listing.price)}>Koop Plant</button>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>Geen planten beschikbaar op de markt om te kopen</p>
//       )}
//     </div>
//   );
// };

// export default BuyFromMarket;
