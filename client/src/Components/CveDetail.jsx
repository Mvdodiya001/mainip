import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import API from '../Utils/axios.config';
import '../Styles/cveDetail.css';

const CveDetail = () => {
	const { cveId } = useParams();
	const navigate = useNavigate();
	const [state, setState] = useState({ loading: true, error: null, data: null });

	useEffect(() => {
		let active = true;
		setState({ loading: true, error: null, data: null });

		API.get(`/api/cve-detail/${cveId}`)
			.then((response) => {
				if (!active) return;
				setState({ loading: false, error: null, data: response.data });
			})
			.catch((err) => {
				if (!active) return;
				const message = err?.response?.data?.message || 'Unable to fetch CVE details';
				setState({ loading: false, error: message, data: null });
			});

		return () => {
			active = false;
		};
	}, [cveId]);

	const cve = state.data;

	if (state.loading) {
		return (
			<div className='cve-detail-page'>
				<div className='workspace-heading-circle'>
					<span className='workspace-heading'>IoT SECURITY LAB - IIIT Allahabad</span>
				</div>
				<div className='cve-loader'>
					<Spinner animation='border' role='status' />
					<span className='ms-2'>Loading CVE details…</span>
				</div>
			</div>
		);
	}

	if (state.error || !cve) {
		return (
			<div className='cve-detail-page'>
				<div className='workspace-heading-circle'>
					<span className='workspace-heading'>IoT SECURITY LAB - IIIT Allahabad</span>
				</div>
				<div className='alert alert-danger mt-3'>
					{state.error || 'CVE not found'}
				</div>
				<button onClick={() => navigate(-1)} className='btn btn-secondary mt-2'>
					Go Back
				</button>
			</div>
		);
	}

	const severityClass = (severity) => {
		if (!severity) return 'severity-unknown';
		return `severity-${severity.toLowerCase()}`;
	};

	return (
		<div className='cve-detail-page'>
			<div className='workspace-heading-circle'>
				<span className='workspace-heading'>IoT SECURITY LAB - IIIT Allahabad</span>
			</div>

			<div className='cve-detail-container'>
				<div className='cve-detail-header'>
					<button onClick={() => navigate(-1)} className='btn btn-secondary mb-3'>
						← Back
					</button>
					<h2 className='cve-detail-id'>{cve.id}</h2>
					<div className='cve-detail-status'>
						{cve.vulnStatus && (
							<span className='badge bg-info text-dark me-2'>
								{cve.vulnStatus}
							</span>
						)}
					</div>
				</div>

				<div className='cve-detail-card'>
					<h4>Description</h4>
					<p className='cve-description'>{cve.descriptions || 'No description available'}</p>
				</div>

				<div className='cve-detail-card'>
					<h4>Metrics</h4>
					<div className='cve-metrics-grid'>
						<div className='metric-item'>
							<label>CVSS Score</label>
							<div className={`metric-value ${severityClass(cve.severity)}`}>
								{cve.score ?? 'N/A'}
							</div>
						</div>
						<div className='metric-item'>
							<label>Severity</label>
							<div className={`metric-value ${severityClass(cve.severity)}`}>
								{cve.severity?.toUpperCase() || 'UNKNOWN'}
							</div>
						</div>
						<div className='metric-item'>
							<label>Score Type</label>
							<div className='metric-value'>{cve.scoreType || 'N/A'}</div>
						</div>
					</div>
				</div>

				{cve.published && (
					<div className='cve-detail-card'>
						<h4>Timeline</h4>
						<div className='cve-timeline'>
							<div className='timeline-item'>
								<label>Published</label>
								<span>{new Date(cve.published).toUTCString()}</span>
							</div>
							{cve.lastModified && (
								<div className='timeline-item'>
									<label>Last Modified</label>
									<span>{new Date(cve.lastModified).toUTCString()}</span>
								</div>
							)}
						</div>
					</div>
				)}

				<div className='cve-detail-card'>
					<h4>References</h4>
					<div className='cve-references'>
						<a
							href={cve.url || `https://nvd.nist.gov/vuln/detail/${cve.id}`}
							target='_blank'
							rel='noreferrer'
							className='btn btn-primary'
						>
							View on NVD Website
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CveDetail;
