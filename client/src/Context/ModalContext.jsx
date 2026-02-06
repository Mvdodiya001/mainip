import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

const ModalUtility = ({children}) => {
	const [rawFileData, setRawFileData] = useState({});
	const [showReport, setShowReport] = useState(false);
    const [modalType, setModalType] = useState('single');
    const [showModal, setShowModal] = useState(false);

    const handleRawFileOpen = (data) => {
        console.log(data);
        setRawFileData(data);
        setShowReport(true);
    }

    const handleRawFileClose = () => {
        setRawFileData({});
        setShowReport(false);
    }

    const showLogoutText = () => {
		const el = document.querySelector('.nav-icon');
		el.innerHTML = `<span class='logout-text'>Logout</span>`;
	};

	const showLogoutIcon = () => {
		const el = document.querySelector('.nav-icon');
		el.innerHTML = `<i class='fa-solid fa-arrow-right-from-bracket logout-icon'></i>`;
	};

    const handleModalOpen = (modalType) => {
        console.log(modalType);
		setModalType(modalType);
        setShowModal(true);
	}

    const handleModalClose = () => {
		setShowModal(false);
	}

    return (
        <ModalContext.Provider
			value={{showReport, rawFileData, modalType, showModal, handleRawFileOpen, handleRawFileClose, showLogoutIcon, showLogoutText, handleModalOpen, handleModalClose }}
		>
			{children}
		</ModalContext.Provider>
    );
}

const useModalContext = () => {
    return useContext(ModalContext);
}

export {useModalContext, ModalUtility};