import React, { useEffect, useMemo, useState } from 'react';
import { Button, Collapse, Spinner, Pagination } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../Utils/axios.config';
import { useData } from '../Context/DataContext';
import '../Styles/report.css';
import '../Styles/cve.css';

const CVES_PER_PAGE = 10;

const severityClass = (severity) => {
	if (!severity) return 'severity-unknown';
	return `severity-${severity.toLowerCase()}`;
};

const CveCard = ({ cve, onClick }) => (
	<div className='cve-card' onClick={onClick} style={{ cursor: 'pointer' }}>
		<div className='cve-card__header'>
			<span className='cve-card__id'>{cve.id}</span>
			<span className={`cve-card__severity ${severityClass(cve.severity)}`}>
				{cve.severity || 'unknown'}
			</span>
		</div>
		<div className='cve-card__meta'>
			<span>Score: {cve.score ?? 'N/A'}</span>
			<span>Published: {cve.published ? new Date(cve.published).toLocaleDateString() : 'N/A'}</span>
		</div>
		<p className='cve-card__desc'>
			{cve.descriptions?.substring(0, 150)}
			{cve.descriptions && cve.descriptions.length > 150 ? '...' : ''}
		</p>
		<div className='cve-card__links'>
			<span className='text-primary'>Click to view details →</span>
		</div>
	</div>
);

const KeywordAccordion = ({ keyword, cves, defaultOpen, onCveClick }) => {
	const [open, setOpen] = useState(defaultOpen);
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(cves.length / CVES_PER_PAGE);
	const startIndex = (currentPage - 1) * CVES_PER_PAGE;
	const endIndex = startIndex + CVES_PER_PAGE;
	const paginatedCves = cves.slice(startIndex, endIndex);

	useEffect(() => {
		setCurrentPage(1);
	}, [cves]);

	return (
		<div className='container report-dropdown-div rounded bg-primary text-light keyword-section'>
			<div className='row justify-content-between align-items-center'>
				<div className='col'>
					<h4 className='m-1 text-uppercase'>
						{keyword}
						<span className='ms-2 badge bg-light text-dark'>
							{cves.length} CVE{cves.length !== 1 ? 's' : ''}
						</span>
					</h4>
				</div>
				<div className='col text-end'>
					<Button
						className='btn py-0 px-2'
						variant='none'
						onClick={() => setOpen((prev) => !prev)}
						aria-controls='collapseContent'
						aria-expanded={open}
					>
						<i className={open ? 'arrow up ' : 'arrow'}></i>
					</Button>
				</div>
			</div>
			<Collapse in={open}>
				<div>
					<div className='cve-card-grid'>
						{paginatedCves.map((cve, index) => (
							<CveCard
								key={`${keyword}-${cve.id}-${index}`}
								cve={cve}
								onClick={() => onCveClick(cve.id)}
							/>
						))}
					</div>
					{totalPages > 1 && (
						<div className='cve-pagination-wrapper'>
							<Pagination className='cve-pagination'>
								<Pagination.First
									onClick={() => setCurrentPage(1)}
									disabled={currentPage === 1}
								/>
								<Pagination.Prev
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									disabled={currentPage === 1}
								/>
								{Array.from({ length: totalPages }, (_, i) => i + 1)
									.filter((page) => {
										return (
											page === 1 ||
											page === totalPages ||
											Math.abs(page - currentPage) <= 1
										);
									})
									.map((page, index, arr) => {
										const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1;
										return (
											<React.Fragment key={page}>
												{showEllipsisBefore && <Pagination.Ellipsis disabled />}
												<Pagination.Item
													active={page === currentPage}
													onClick={() => setCurrentPage(page)}
												>
													{page}
												</Pagination.Item>
											</React.Fragment>
										);
									})}
								<Pagination.Next
									onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
									disabled={currentPage === totalPages}
								/>
								<Pagination.Last
									onClick={() => setCurrentPage(totalPages)}
									disabled={currentPage === totalPages}
								/>
							</Pagination>
							<div className='cve-page-info'>
								Page {currentPage} of {totalPages} ({cves.length} total CVEs)
							</div>
						</div>
					)}
				</div>
			</Collapse>
		</div>
	);
};

const CveAnalysis = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { IPsData } = useData();
	const [state, setState] = useState({ loading: true, error: null, data: null });

	const ipAddress = useMemo(() => {
		const match = IPsData.find((entry) => entry.id === id);
		return match?.ip || '';
	}, [IPsData, id]);

	const [wordList, setWordList] = useState([]);

	// Fetch and auto-update word list from backend
	useEffect(() => {
		const fetchWords = async () => {
			try {
				const response = await fetch('/api/cve/words');
				const data = await response.json();
				setWordList(data);
			} catch (e) {
				setWordList([]);
			}
		};
		fetchWords();
		const interval = setInterval(fetchWords, 10000); // Auto-update every 10s
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		let active = true;
		setState({ loading: true, error: null, data: null });
		API.get(`/api/cve/${id}`)
			.then((response) => {
				if (!active) return;
				setState({ loading: false, error: null, data: response.data });
			})
			.catch((err) => {
				if (!active) return;
				const message = err?.response?.data?.message || 'Unable to fetch CVE data';
				setState({ loading: false, error: message, data: null });
			});
		return () => {
			active = false;
		};
	}, [id]);

	const handleCveClick = (cveId) => {
		navigate(`/cve-detail/${cveId}`);
	};

	const keywords = state.data?.services || [];
	const cvesByKeyword = state.data?.cvesByService || [];
	const totalCves = state.data?.totalCves || 0;

	return (
		<div className='cve-page'>
			<div className='cve-header'>
				<div>
					<div className='workspace-heading-circle'>
						<span className='workspace-heading'>IoT SECURITY LAB - IIIT Allahabad</span>
					</div>
					<h2 className='cve-title'>CVE Analysis</h2>
					<p className='cve-subtitle'>Report for {ipAddress || state.data?.ip || 'selected host'}</p>
				</div>
				<div className='cve-actions'>
					<Button variant='light' className='me-2' onClick={() => navigate(-1)}>
						Back
					</Button>
					<Button variant='primary' onClick={() => navigate(`/reports/${id}`)}>
						View Report
					</Button>
				</div>
			</div>

			<div className='cve-metrics'>
				<div className='cve-pill'>Keywords Extracted: {keywords.length}</div>
				<div className='cve-pill'>CVE Matches: {totalCves}</div>
			</div>

			{state.loading && (
				<div className='cve-loader'>
					<Spinner animation='border' role='status' />
					<span className='ms-2'>Loading CVE results…</span>
				</div>
			)}

			{state.error && !state.loading && (
				<div className='cve-error alert alert-danger'>
					{state.error}
					<ul>
						{wordList.map(({ word, version, hasCVE }, idx) => (
							<li key={idx}>
								{word} {version ? `v${version}` : ''} - {hasCVE ? 'CVE Found' : 'No CVE Found'}
							</li>
						))}
					</ul>
					{wordList.length === 0 && <p>No words found.</p>}
				</div>
			)}

			{!state.loading && !state.error && keywords.length === 0 && (
				<div className='cve-empty'>
					<h5>No services or keywords detected for CVE analysis.</h5>
				</div>
			)}

			{!state.loading && !state.error && cvesByKeyword.length === 0 && keywords.length > 0 && (
				<div className='cve-empty'>
					<h5>No CVEs matched the detected keywords:</h5>
					<div className='detected-keywords'>
						{keywords.map((kw, i) => (
							<span key={i} className='badge bg-secondary me-2 mb-2'>
								{kw.service}
								{kw.version && kw.version !== 'Any' ? ` (${kw.version})` : ''}
							</span>
						))}
					</div>
				</div>
			)}

			{cvesByKeyword.map((entry, index) => (
				<KeywordAccordion
					key={`${entry.service}-${entry.port}-${index}`}
					keyword={`${entry.service}${entry.version && entry.version !== 'Any' ? ` · ${entry.version}` : ''}${entry.port ? ` · Port ${entry.port}` : ''}`}
					cves={entry.cves}
					defaultOpen={cvesByKeyword.length <= 2}
					onCveClick={handleCveClick}
				/>
			))}
		</div>
	);
};

export default CveAnalysis;
