import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDetailsForm = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirthAd: '',
        dateOfBirthBs: '',
        gender: '',
        nationality: '',
        citizenshipNumber: '',
        citizenshipIssueDate: '',
        citizenshipIssueDistrict: '',
        beneficiaryIdNo: '',
        panNumber: '',
        identificationNoNrn: '',
        currentWardNo: '',
        currentMunicipality: '',
        currentDistrict: '',
        currentProvince: '',
        currentCountry: '',
        permanentWardNo: '',
        permanentMunicipality: '',
        permanentDistrict: '',
        permanentProvince: '',
        permanentCountry: '',
        contactNumber: '',
        emailAddress: '',
        fatherName: '',
        motherName: '',
        grandfatherName: '',
        spouseName: '',
        childrenNames: '',
        inlawsNames: '',
        accountType: '',
        accountNumber: '',
        bankName: '',
        bankAddress: '',
        occupation: '',
        businessType: '',
        organizationName: '',
        organizationAddress: '',
        designation: '',
        employeeIdNo: '',
        annualIncomeBracket: '',
        guardianName: '',
        guardianRelationship: '',
        guardianAddress: '',
        guardianFaxNo: '',
        guardianTelephoneNo: '',
        guardianEmail: '',
        guardianPanNo: '',
        guardianMobileNo: '',
        guardianBirthRegNo: '',
        guardianIssueDate: '',
        guardianIssuingAuthority: '',
        involvedInOtherInvestments: false,
        investmentDetails: '',
        legalDeclaration: '',
        legalConsent: false
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get('/api/userdetails');
                if (response.data) {
                    setFormData(response.data);
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };
        fetchDetails();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/userdetails', formData);
            alert('User details saved successfully!');
        } catch (error) {
            console.error("Error saving user details:", error);
            alert('Failed to save user details.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold mb-4 text-indigo-400">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Date of Birth (AD)</label>
                                <input type="date" name="dateOfBirthAd" value={formData.dateOfBirthAd} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Nationality</label>
                                <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Citizenship No</label>
                                <input type="text" name="citizenshipNumber" value={formData.citizenshipNumber} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">PAN Number</label>
                                <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold mb-4 text-indigo-400">Address Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2"><h4 className="text-md font-medium text-gray-300">Current Address</h4></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Municipality</label>
                                <input type="text" name="currentMunicipality" value={formData.currentMunicipality} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">District</label>
                                <input type="text" name="currentDistrict" value={formData.currentDistrict} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div className="col-span-2"><h4 className="text-md font-medium text-gray-300">Permanent Address</h4></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Municipality</label>
                                <input type="text" name="permanentMunicipality" value={formData.permanentMunicipality} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">District</label>
                                <input type="text" name="permanentDistrict" value={formData.permanentDistrict} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Contact Number</label>
                                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Email Address</label>
                                <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold mb-4 text-indigo-400">Family & Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Father's Name</label>
                                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Mother's Name</label>
                                <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div className="col-span-2"><h4 className="text-md font-medium text-gray-300">Bank Information</h4></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Bank Name</label>
                                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Account Number</label>
                                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold mb-4 text-indigo-400">Legal & Consent</h3>
                        <div className="space-y-2">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input name="involvedInOtherInvestments" type="checkbox" checked={formData.involvedInOtherInvestments} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-700 rounded" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label className="font-medium text-gray-300">Involved in other investments?</label>
                                </div>
                            </div>
                            {formData.involvedInOtherInvestments && (
                                <textarea name="investmentDetails" value={formData.investmentDetails} onChange={handleChange} placeholder="Details of other investments..." className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" rows="3"></textarea>
                            )}
                            <div className="pt-4">
                                <label className="block text-sm font-medium text-gray-400">Legal Declaration</label>
                                <textarea name="legalDeclaration" value={formData.legalDeclaration} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-2" rows="4" placeholder="I hereby declare that..."></textarea>
                            </div>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input name="legalConsent" type="checkbox" checked={formData.legalConsent} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-700 rounded" required />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label className="font-medium text-gray-300">I agree to the legal consent terms.</label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 mt-10">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">User Details Registration</h2>
                    <span className="text-indigo-500 font-medium">Step {step} of 4</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {renderStep()}

                <div className="mt-8 flex justify-between">
                    {step > 1 && (
                        <button type="button" onClick={handleBack} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
                            Previous
                        </button>
                    )}
                    {step < 4 ? (
                        <button type="button" onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg ml-auto transition-colors duration-200">
                            Next
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-lg ml-auto transition-colors duration-200 flex items-center">
                            {loading ? 'Saving...' : 'Submit Details'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default UserDetailsForm;
