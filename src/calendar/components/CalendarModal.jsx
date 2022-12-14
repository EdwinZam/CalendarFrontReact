import { addHours, differenceInSeconds } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from 'date-fns/locale/es';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useCalendarStore, useUiStore } from '../../hooks';

registerLocale('es', es);

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
      },
  };

  Modal.setAppElement('#root');

export const CalendarModal = () => {

    const { isDateModalOpen, closeDateModal } = useUiStore();
    const { activeEvent, startSavingEvent } = useCalendarStore();
    //const [isOpen, setisOpen] = useState(true);
    const [formSubmitted, setformSubmitted] = useState(false)

    const [formValue, setformValue] = useState({
        title: '',
        notes: '',
        start: new Date(),
        end: addHours( new Date(), 2),
    });

    const titleClass = useMemo(() => {
        if(!formSubmitted) return '';
        return (formValue.title.length > 0)
            ? ''
            : 'is-invalid';
    }, [formValue.title, formSubmitted])

    useEffect(() => {
      if(activeEvent !== null){
        setformValue({ ...activeEvent});
      }
    }, [activeEvent])
      

    const onInputChanged = ({target}) => {
        setformValue({
            ...formValue,
            [target.name]: target.value
        })
    }    

    const onDateChanged = (event, changing ) => {
        setformValue({
            ...formValue,
            [changing]: event
        })
    }

    const onCloseModal = ()=> {
       // console.log('cerrando Modal');
       closeDateModal();
        //setisOpen(false);
    }

    const onSubmit = async(event) =>{
        event.preventDefault();
        setformSubmitted(true);
        const difference = differenceInSeconds(formValue.end, formValue.start);
        if(isNaN(difference) || difference <= 0 ){
            Swal.fire('Fechas incorrectas', 'Revisar las fechas ingresados', 'error');
            return;
        }
        if(formValue.title.length <= 0 ) return ;

        await startSavingEvent(formValue);
        closeDateModal();
        setformSubmitted(false);
    }

  return (
    <Modal
        isOpen= { isDateModalOpen }
        onRequestClose={onCloseModal}
        style={customStyles}
        className = "modal"
        overlayClassName="modal-fondo"
        closeTimeoutMS= {200}

    >
        <h1> Nuevo evento </h1>
        <hr />
        <form className="container" onSubmit={onSubmit} >

            <div className="form-group mb-2">
                <label>Fecha y hora inicio</label>
                <DatePicker 
                    selected={formValue.start}
                    onChange={(event) => onDateChanged(event, 'start')  }
                    className="form-control"
                    dateFormat="Pp"
                    showTimeSelect
                    locale="es"
                    timeCaption="Hora"
                />
            </div>

            <div className="form-group mb-2">
                <label>Fecha y hora fin</label>
                <DatePicker
                    minDate={formValue.start} 
                    selected={formValue.end}
                    onChange={(event) => onDateChanged(event, 'end')  }
                    className="form-control"
                    dateFormat="Pp"
                    showTimeSelect
                    locale="es"
                    timeCaption="Hora"
                />
            </div>

            <hr />
            <div className="form-group mb-2">
                <label>Titulo y notas</label>
                <input 
                    type="text" 
                    className={`form-control ${titleClass}`}
                    placeholder="T??tulo del evento"
                    name="title"
                    autoComplete="off"
                    value={formValue.title}
                    onChange = {onInputChanged}
                />
                <small id="emailHelp" className="form-text text-muted">Una descripci??n corta</small>
            </div>

            <div className="form-group mb-2">
                <textarea 
                    type="text" 
                    className="form-control"
                    placeholder="Notas"
                    rows="5"
                    name="notes"
                    value={formValue.notes}
                    onChange = {onInputChanged}
                ></textarea>
                <small id="emailHelp" className="form-text text-muted">Informaci??n adicional</small>
            </div>

            <button
                type="submit"
                className="btn btn-outline-primary btn-block"
            >
                <i className="far fa-save"></i>
                <span> Guardar</span>
            </button>

        </form>

    </Modal>
  )
}
