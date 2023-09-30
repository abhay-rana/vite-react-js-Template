import { useRef, useState } from 'react';

import Button from '~/components/button/button';
import TextAreaWithLineNumbers from '~/components/textarea-lines';

function _keepFirstAddress(address_amount) {
    const uniqueAddresses = {};
    const resultArray = [];

    for (const item of address_amount) {
        const address = item.split(' ')[0]; // Extract the address part
        if (!uniqueAddresses[address]) {
            uniqueAddresses[address] = true;
            resultArray.push(item);
        }
    }

    console.log(resultArray.join('\n'));

    return resultArray.join('\n');
}

function _combineAddress(inputArray) {
    const addressMap = new Map();

    for (const item of inputArray) {
        const [address, balance] = item.split(' ');
        if (addressMap.has(address)) {
            addressMap.set(
                address,
                addressMap.get(address) + parseInt(balance)
            );
        } else {
            addressMap.set(address, parseInt(balance));
        }
    }

    const combinedItems = [];
    for (const [address, balance] of addressMap.entries()) {
        combinedItems.push(`${address} ${balance}`);
    }
    console.log(combinedItems);
    return combinedItems;
}

function _checkDuplicatesIndex(inputArray) {
    const addressIndexes = {}; // Object to store address and their indexes
    const outputArray = [];
    const error = {
        duplicated_error: false,
        error_arr: [],
    };

    for (let index = 0; index < inputArray.length; index++) {
        const [address] = inputArray[index].split(' '); // Split the string to get the address
        if (addressIndexes[address] === undefined) {
            // If address is not already in the object, add it with the current index
            addressIndexes[address] = [index];
        } else {
            // If address is already in the object, push the current index to the array
            addressIndexes[address].push(index);
            error.duplicated_error = true;
        }
    }

    console.log('addressIndexes', addressIndexes);

    // Iterate through the object and create output entries for duplicates
    for (const address in addressIndexes) {
        if (addressIndexes[address].length > 1) {
            const indexes = addressIndexes[address]
                .map((index) => index + 1)
                .join(',');
            outputArray.push(
                `Address ${address} encountered duplicate in Line :${indexes}`
            );
        }
    }
    console.log(outputArray);
    return { ...error, error_arr: outputArray, addressIndexes: addressIndexes };
}

function _checkValidAmount(array) {
    const error = {
        error_arr: [],
        duplicated_error: false,
    };
    const isNumeric = (string_) => {
        // Check if the string is not empty and contains only numeric characters or spaces
        return /^[0-9\s]+$/.test(string_);
    };

    const indexesOfNonNumericAmounts = array
        .map((item, index) => (isNumeric(item.split(' ')[1]) ? -1 : index))
        .filter((index) => index !== -1);

    if (indexesOfNonNumericAmounts.length > 0) {
        const error_string = indexesOfNonNumericAmounts.map(
            (item) => `Line ${item + 1} wrong Amount`
        );
        return { ...error, error_arr: error_string };
    } else {
        return error;
    }
}

function _checkValidations(array) {
    let error_valid_amount = {
        error_arr: [],
        duplicated_error: false,
    };
    error_valid_amount = _checkValidAmount(array);
    if (error_valid_amount.error_arr.length > 0) return error_valid_amount;

    error_valid_amount = _checkDuplicatesIndex(array);
    return error_valid_amount;
}

const Dispense = () => {
    const textarea_reference = useRef('');
    const [address, setAddress] = useState('');
    const [address_amount, setAddressAmount] = useState('');
    const [error, setError] = useState({
        error_arr: [],
        duplicated_error: false,
        addressIndexes: {},
        success: false,
    });

    function onSubmit() {
        const address_array =
            textarea_reference.current.innerHTML.split(/\n/gm);
        console.log(address_array);
        setAddressAmount(address_array);
        const validation_data = _checkValidations(address_array);
        if (validation_data.error_arr.length > 0) {
            return setError(validation_data);
        }
        setError({ ...validation_data, success: true });
        console.log(validation_data);
    }

    function removeDuplicates(type) {
        if (type === 'keep') {
            const new_address = _keepFirstAddress(address_amount);
            setAddress(new_address);
        } else if (type === 'combine') {
            const new_address = _combineAddress(address_amount);
            setAddress(new_address);
        }
        setError({
            error_arr: [],
            duplicated_error: false,
            addressIndexes: {},
        });
    }

    return (
        <>
            <div className="flex flex-col gap-5">
                <TextAreaWithLineNumbers
                    onChange={setAddress}
                    value={address}
                    ref={textarea_reference}
                />
                {error.duplicated_error && (
                    <>
                        <div className="flex flex-row justify-between text-danger">
                            <p>Duplicated</p>
                            <div className="flex cursor-pointer flex-row gap-1">
                                <p onClick={() => removeDuplicates('keep')}>
                                    Keep the first One
                                </p>
                                <p>{'|'}</p>
                                <p onClick={() => removeDuplicates('combine')}>
                                    Combine balance
                                </p>
                            </div>
                        </div>
                    </>
                )}
                {error.error_arr.length > 0 ? (
                    <div className="border-2 border-danger p-3">
                        {error.error_arr.map((error_string, index) => (
                            <p key={index} className="text-danger">
                                {error_string}
                            </p>
                        ))}
                    </div>
                ) : null}
                {error.success ? (
                    <div className="border-2 border-success p-3 font-bold">
                        <p className="text-16 text-success">
                            Validations Passed
                        </p>
                    </div>
                ) : null}
                <Button onClick={onSubmit} block className={'h-14'}>
                    Submit
                </Button>
            </div>
        </>
    );
};

export default Dispense;
