import apiClient from './apiClient';

const claimsAPI = {
  /**
   * Fetch claims list
   * @param {number} claimModeId - Claim mode ID (1 for NetRate)
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Records per page (default: 10)
   * @param {string} sortOrder - Sort order: ASC or DESC (default: DESC)
   */
  getClaimsList: async (claimModeId = 1, page = 1, limit = 10, sortOrder = 'DESC') => {
    try {
      const response = await apiClient.post('/claims/claim/list', {
        claimModeId,
        page,
        limit,
        sortOrder
      });
      return response;
    } catch (error) {
      console.error('Error fetching claims list:', error);
      throw error;
    }
  },

  /**
   * Get claim details
   * @param {string} claimId - Claim ID
   */
  getClaimDetails: async (claimId) => {
    try {
      const response = await apiClient.get(`/claims/claim/${claimId}`);
      return response;
    } catch (error) {
      console.error('Error fetching claim details:', error);
      throw error;
    }
  },

  /**
   * Update claim status
   * @param {string} claimId - Claim ID
   * @param {string} status - New status
   */
  updateClaimStatus: async (claimId, status) => {
    try {
      const response = await apiClient.patch(`/claims/claim/${claimId}`, {
        status
      });
      return response;
    } catch (error) {
      console.error('Error updating claim status:', error);
      throw error;
    }
  }
};

export default claimsAPI;
