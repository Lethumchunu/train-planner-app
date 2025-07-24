import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const selectStyle = {
  padding: '6px 10px',
  marginTop: '5px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  width: '100%',
};


// ✅ Add the formatter here!
const formatTime = (isoTime) =>
  new Date(isoTime).toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

function App() {
  const [timetables, setTimetables] = useState([]);
  const [allTrains, setAllTrains] = useState([]);
  const [selectedDay, setSelectedDay] = useState(
    new Date().toLocaleDateString('en-US', { weekday: 'short' })
  );

  const [stations, setStations] = useState([]);
  const [startStationId, setStartStationId] = useState(null);
  const [endStationId, setEndStationId] = useState(null);
  
  const isDisabled = !selectedDay && !startStationId && !endStationId;

  const handleMorningOnly = () => {
    const filteredMorningTrains = timetables.filter((t) => {
      const hour = parseInt(t.departure_time.split(':')[0], 10);
      return hour >= 5 && hour <= 10;
    });
    setTimetables(filteredMorningTrains);
  };

  const resetFilters = () => {
    setStartStationId(null);
    setEndStationId(null);
    setSelectedDay(new Date().toLocaleDateString('en-US', { weekday: 'short' }));
    setTimetables(allTrains); // ✅ restore the full train list
  };

  const handlePeakHours = () => {
  const peakTrains = allTrains.filter((t) => {
    const hour = parseInt(t.departure_time.split(':')[0], 10);
    return (hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 19);
  });
  setTimetables(peakTrains);
};

  const handleEveningOnly = () => {
  const eveningTrains = timetables.filter((t) => {
    const hour = parseInt(t.departure_time.split(':')[0], 10);
    return hour >= 17 && hour <= 22;
  });
  setTimetables(eveningTrains);
};

  const [activePreset, setActivePreset] = useState('All Trains');



  useEffect(() => {
    console.log('Selected day is:', selectedDay);

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('timetables')
        .select(`
          id,
          route_id,
          departure_time,
          arrival_time,
          days_active,
          routes (
            start_station:stations!routes_start_station_id_fkey (
              id,
              name
            ),
            end_station:stations!routes_end_station_id_fkey (
              id,
              name
            )
          )
        `)
      .ilike('days_active', `%${selectedDay}%`);

    if (error) {
      console.error('Error fetching data:', error);
      setTimetables([]);
    } else {

      
      // Filter results based on selected stations
      const filtered = data.filter((t) =>
        (!startStationId || t.routes?.start_station?.id === startStationId) &&
        (!endStationId || t.routes?.end_station?.id === endStationId)
      );

      setTimetables(filtered);
      setAllTrains(data);
      console.log('Filtered data:', filtered);
    }
  };

  fetchData();
}, [selectedDay, startStationId, endStationId]); // 👈 add all dependencies here

  useEffect(() => {
    const fetchStations = async () => {
      const { data, error } = await supabase
        .from('stations')
        .select('id, name');

      if (!error) {
        setStations(data);
      } else {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
  const cards = document.querySelectorAll('.timetable-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('visible');
    }, index * 100); // Stagger fade-ins by 100ms
  });
}, [timetables]);

  return (
    <div className="App">
      <h1>Today’s Train Timetable 🚆</h1>

      <div className="filter-panel">
     
        <h2 style={{ marginBottom: '12px' }}>Filter Your Trip</h2>

        {/* Day Selector */}
        <div style={{ marginBottom: '12px' }}>
          <label><strong>Select a Day:</strong></label><br />
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            style={selectStyle}
          >
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => (
              <option key={day} value={day}>
                {new Date(`2023-07-${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].indexOf(day)+3}`)
                  .toLocaleDateString('en-ZA', { weekday: 'long' })}
              </option>
            ))}
          </select>
        </div>

        {/* Start Station */}
        <div style={{ marginBottom: '12px' }}>
            <label><strong>From (Start Station):</strong></label><br />
            <select
              value={startStationId || ''}
              onChange={(e) => setStartStationId(Number(e.target.value))}
              style={selectStyle}
            >
              <option value="">All Start Stations</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
  

          {/* ✅ Move your End Station here */}
          <div style={{ marginBottom: '12px' }}>
            <label><strong>To (End Station):</strong></label><br />
            <select
              value={endStationId || ''}
              onChange={(e) => setEndStationId(Number(e.target.value))}
              style={selectStyle}
            >
      <option value="">All End Stations</option>
      {stations.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  </div>

  {/* Reset Filters Button */}
<button
  disabled={isDisabled}
  onClick={() => {
    setStartStationId(null);
    setEndStationId(null);
    setSelectedDay(new Date().toLocaleDateString('en-US', { weekday: 'short' }));
  }}
  style={{
    marginTop: '12px',
    padding: '8px 12px',
    backgroundColor: isDisabled ? '#ddd' : '#f44336',
    color: isDisabled ? '#666' : 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: isDisabled ? 'not-allowed' : 'pointer'
  }}
>
  Reset Filters
</button>

</div>

<div className="preset-buttons" style={{ marginTop: '16px', marginBottom: '12px' }}>
  <button onClick={handleMorningOnly} className="preset-button">
    Morning Only
  </button>

  <button onClick={handleEveningOnly} className="preset-button">
    Evening Only
  </button>

  <button onClick={handlePeakHours} className="preset-button peak">
    Peak Hours
  </button>
  
  <button onClick={resetFilters} className="preset-button reset">
    Show All
  </button>
</div>

<p style={{ fontStyle: 'italic', marginTop: '12px' }}>
  Currently viewing: <strong>{activePreset}</strong>
</p>
      {timetables.length > 0 ? (
        timetables.map((t) => {
          const isSingleDay = t.days_active === selectedDay;

          return (
            <div
              key={t.id}
              className="timetable-card"
            >
              <div
                style={{
                  border: `2px solid ${isSingleDay ? '#4CAF50' : '#2196F3'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                  <p><strong>Route:</strong> {t.route_id}</p>
                  <p><strong>Departure:</strong> {formatTime(t.departure_time)}</p>
                  <p><strong>Arrival:</strong> {formatTime(t.arrival_time)}</p>
                  <p><strong>From:</strong> {t.routes?.start_station?.name}</p>
                  <p><strong>To:</strong> {t.routes?.end_station?.name}</p>
                  <p><strong>Active Days:</strong> {t.days_active}</p>
                </div>
              </div>

          );
        })
      ) : (
        <p style={{ color: '#757575', marginTop: '16px' }}>
          🚫 No trains scheduled for <strong>{selectedDay}</strong>. Try another day or adjust your filters.
        </p>
        

      )}
      
      <p style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '20px', textAlign: 'center' }}>
  🚆 Built for South Africa’s rail riders. Live data, smart filters, smoother commutes.
</p>
    </div>
  );
  
}

export default App;
