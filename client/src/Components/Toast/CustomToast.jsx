const CustomToast = ({ closeToast }) => (
    <div>
        <p>Weet je zeker dat je deze actie wilt uitvoeren?</p>
        <button onClick={() => handleConfirm(closeToast)}>Bevestigen</button>
        <button onClick={closeToast}>Annuleren</button>
    </div>
);

const handleConfirm = (closeToast) => {
    closeToast();
};
