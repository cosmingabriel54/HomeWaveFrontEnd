import React, { useEffect } from "react";
import Modal from "react-modal";
import { useTranslation } from "react-i18next";

interface InputDialogProps {
    isOpen: boolean;
    title: string;
    label: string;
    placeholder?: string;
    showCodeField?: boolean;
    onCancel: () => void;
    onSubmit: (name: string, code?: string) => void;
}

const InputDialog: React.FC<InputDialogProps> = ({
                                                     isOpen,
                                                     title,
                                                     label,
                                                     placeholder,
                                                     showCodeField,
                                                     onCancel,
                                                     onSubmit,
                                                 }) => {
    const [name, setName] = React.useState("");
    const [code, setCode] = React.useState("");
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            setName("");
            setCode("");
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const trimmedName = name.trim();
        const trimmedCode = code.trim();

        if (!trimmedName && !trimmedCode) {
            console.warn("Both fields are empty, cannot submit.");
            return;
        }
        onSubmit(trimmedName || "", trimmedCode || undefined);

        setName("");
        setCode("");
    };


    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancel}
            ariaHideApp={false}
            className="modal"
            overlayClassName="overlay"
        >
            <h2>{t(title)}</h2>
            <label>{t(label)}</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={placeholder}
            />
            {showCodeField && (
                <>
                    <label>{t("dialog.orCode")}</label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={t("dialog.codePlaceholder")}
                    />
                </>
            )}
            <div className="modal-actions">
                <button onClick={onCancel}>{t("dialog.cancel")}</button>
                <button className="confirm-btn" onClick={handleSubmit}>
                    {t("dialog.submit")}
                </button>
            </div>
        </Modal>
    );
};

export default InputDialog;
